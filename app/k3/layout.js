import "./k3.css";
import "./dice3d.css";

export const metadata = {
  title: "K3 Lottery",
  description: "Play K3 Lottery on Luvomall",
};

export default function K3Layout({ children }) {
  return <div className="k3-layout">{children}</div>;
}
