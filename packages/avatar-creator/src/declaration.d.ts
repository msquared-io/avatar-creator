declare module "*.hdr" {
  const value: string;
  export default value;
}

declare module "*.webp" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.glb" {
  const value: string;
  export default value;
}

declare module "*.module.css" {
  const content: { [className: string]: string };
  export default content;
}

declare global {
  interface Window {
    app: any;
  }
}
