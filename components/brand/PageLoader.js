import LoadingDialog from "@/components/auth/LoadingDialog";

export default function PageLoader() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "transparent" }}>
      <LoadingDialog visible={true} />
    </div>
  );
}
