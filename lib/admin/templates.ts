import { prisma } from "@/lib/prisma";

export async function getAllTemplates() {
  const templates = await prisma.predictionTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (templates.length === 0) {
    const defaultFields = {};
    
    try {
      const seeded = await prisma.predictionTemplate.create({
        data: {
          name: "Luvo Mall Base template",
          imageUrl: "/design/prediction_template_base.png",
          fields: defaultFields,
          isDefault: true,
        }
      });
      return [seeded];
    } catch (e) {
      console.error("Auto seeding default template failed:", e);
    }
  }

  return templates;
}

export async function getTemplateById(id: string) {
  return prisma.predictionTemplate.findUnique({
    where: { id },
  });
}

export async function createTemplate(name: string, imageUrl: string, fields: any) {
  const count = await prisma.predictionTemplate.count();
  const isDefault = count === 0;

  return prisma.predictionTemplate.create({
    data: {
      name,
      imageUrl,
      fields,
      isDefault,
    },
  });
}

export async function updateTemplate(id: string, data: { name?: string; fields?: any; isDefault?: boolean }) {
  if (data.isDefault) {
    await prisma.$transaction([
      prisma.predictionTemplate.updateMany({
        where: { NOT: { id } },
        data: { isDefault: false },
      }),
      prisma.predictionTemplate.update({
        where: { id },
        data: { ...data, isDefault: true },
      }),
    ]);
    return getTemplateById(id);
  }

  return prisma.predictionTemplate.update({
    where: { id },
    data,
  });
}

export async function duplicateTemplate(id: string) {
  const source = await getTemplateById(id);
  if (!source) throw new Error("Template not found");

  return prisma.predictionTemplate.create({
    data: {
      name: `${source.name} Copy`,
      imageUrl: source.imageUrl,
      fields: source.fields || {},
      isDefault: false,
    },
  });
}

export async function deleteTemplate(id: string) {
  const template = await getTemplateById(id);
  if (!template) throw new Error("Template not found");

  await prisma.predictionTemplate.delete({
    where: { id },
  });

  if (template.isDefault) {
    const nextTemplate = await prisma.predictionTemplate.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (nextTemplate) {
      await prisma.predictionTemplate.update({
        where: { id: nextTemplate.id },
        data: { isDefault: true },
      });
    }
  }
}

export async function setDefaultTemplate(id: string) {
  return updateTemplate(id, { isDefault: true });
}
