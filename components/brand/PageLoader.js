import LoadingDialog from "@/components/auth/LoadingDialog";

export default function PageLoader() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(1.5px)" }}>
      <LoadingDialog visible={true} />
    </div>
  );
}
