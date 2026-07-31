import { BRAND_LOGO_SRC, BRAND_NAME } from "@/lib/brand";

export default function PageLoader() {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffff",
      zIndex: 9999,
    }}>
      {/* Halo spinner container wrapping the logo */}
      <div style={{
        position: "relative",
        width: "160px",
        height: "160px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 150, 136, 0.02)",
        border: "3px solid rgba(0, 150, 136, 0.1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        animation: "pulse 2s infinite ease-in-out"
      }}>
        {/* Revolving teal border spinner */}
        <div style={{
          position: "absolute",
          inset: "-3px",
          borderRadius: "50%",
          border: "3px solid transparent",
          borderTop: "3px solid #009688",
          borderRight: "3px solid rgba(0, 150, 136, 0.3)",
          animation: "spin 1.2s linear infinite"
        }} />

        {/* Logo Image */}
        <img
          src={BRAND_LOGO_SRC}
          alt={BRAND_NAME}
          style={{
            width: "120px",
            height: "auto",
            maxHeight: "60px",
            objectFit: "contain",
            zIndex: 2
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.9; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.01); }
        }
      `}</style>
    </div>
  );
}
