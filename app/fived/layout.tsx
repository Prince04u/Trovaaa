import "./fived.css";

export const metadata = {
  title: "5D Lottery - Superwin",
  description: "Play 5D Lottery on Superwin",
};

export default function FiveDLayout({ children }: { children: React.ReactNode }) {
  return <div className="fived-layout">{children}</div>;
}
