import "./test-access.css";

export default function TestAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="private-access">{children}</div>;
}
