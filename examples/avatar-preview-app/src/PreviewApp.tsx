import { AvatarCreatorApp } from "@private/avatar-creator";

export default function PreviewApp() {
  const dataUrl = process.env.NEXT_PUBLIC_CATALOGUE_DATA_URL || "/data.json";
  return <AvatarCreatorApp dataUrl={dataUrl} />;
}
