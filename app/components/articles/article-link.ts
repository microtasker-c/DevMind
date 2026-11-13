import { Link } from "@tiptap/extension-link";

// HTTP(S) and mailto are built into linkifyjs. Registering BlockNote's custom
// protocol list again after link detection has started produces warnings.
export const articleLink = Link.extend({ inclusive: false }).configure({
  defaultProtocol: "https",
  protocols: [],
});
