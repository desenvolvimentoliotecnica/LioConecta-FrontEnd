import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import "../../styles/email-rich-text.css";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  /** When true, enables H2/H3 in StarterKit and toolbar. */
  enableHeadings?: boolean;
};

function ToolbarButton({
  active,
  label,
  onClick,
  icon,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  icon: string;
}) {
  return (
    <button
      type="button"
      className={active ? "is-active" : undefined}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escreva sua mensagem…",
  disabled = false,
  minHeight = 180,
  enableHeadings = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: enableHeadings ? { levels: [2, 3] } : false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link:", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className={`email-rich-text${disabled ? " is-disabled" : ""}`}>
      <div className="email-rich-text__toolbar" role="toolbar" aria-label="Formatação">
        {enableHeadings ? (
          <>
            <ToolbarButton
              label="Título 2"
              icon="fa-heading"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            />
            <ToolbarButton
              label="Título 3"
              icon="fa-font"
              active={editor.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            />
          </>
        ) : null}
        <ToolbarButton
          label="Negrito"
          icon="fa-bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Itálico"
          icon="fa-italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Sublinhado"
          icon="fa-underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="Lista com marcadores"
          icon="fa-list-ul"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Lista numerada"
          icon="fa-list-ol"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton label="Inserir link" icon="fa-link" onClick={setLink} />
        <ToolbarButton
          label="Desfazer"
          icon="fa-rotate-left"
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Refazer"
          icon="fa-rotate-right"
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
      <EditorContent
        editor={editor}
        className="email-rich-text__editor"
        style={{ minHeight }}
      />
    </div>
  );
}
