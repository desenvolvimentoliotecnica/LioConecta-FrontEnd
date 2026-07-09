import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import "../../styles/unilio-article-editor.css";

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: number;
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

function ToolbarDivider() {
  return <span className="unilio-article-editor__divider" aria-hidden="true" />;
}

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function UniLioArticleEditor({
  value,
  onChange,
  disabled = false,
  placeholder = "Escreva o conteúdo do módulo…",
  minHeight = 280,
}: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "unilio-article-editor__image",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "unilio-article-editor__video",
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

  function setLink() {
    const previous = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link:", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function insertImageFromUrl() {
    const url = window.prompt("URL da imagem:", "https://");
    if (!url?.trim()) return;
    editor!.chain().focus().setImage({ src: url.trim() }).run();
  }

  async function insertImageFromFile(file: File) {
    if (!file.type.startsWith("image/")) {
      window.alert("Selecione um arquivo de imagem (PNG, JPG, GIF ou WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      window.alert("A imagem deve ter no máximo 2 MB nesta versão.");
      return;
    }
    const dataUrl = await readImageAsDataUrl(file);
    editor!.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
  }

  function insertYoutube() {
    const url = window.prompt("Cole o link do YouTube:", "https://www.youtube.com/watch?v=");
    if (!url?.trim()) return;
    editor!.commands.setYoutubeVideo({ src: url.trim() });
  }

  return (
    <div className={`unilio-article-editor${disabled ? " is-disabled" : ""}`}>
      <div className="unilio-article-editor__toolbar" role="toolbar" aria-label="Formatação do conteúdo">
        <ToolbarButton
          label="Título seção (H2)"
          icon="fa-heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Subtítulo (H3)"
          icon="fa-h"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarDivider />
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
          label="Tachado"
          icon="fa-strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarDivider />
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
        <ToolbarButton
          label="Citação"
          icon="fa-quote-left"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          label="Alinhar à esquerda"
          icon="fa-align-left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <ToolbarButton
          label="Centralizar"
          icon="fa-align-center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <ToolbarButton
          label="Alinhar à direita"
          icon="fa-align-right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />
        <ToolbarDivider />
        <ToolbarButton label="Inserir link" icon="fa-link" onClick={setLink} />
        <ToolbarButton label="Imagem por URL" icon="fa-image" onClick={insertImageFromUrl} />
        <ToolbarButton
          label="Enviar imagem"
          icon="fa-file-image"
          onClick={() => imageInputRef.current?.click()}
        />
        <ToolbarButton label="Vídeo do YouTube" icon="fa-brands fa-youtube" onClick={insertYoutube} />
        <ToolbarButton
          label="Inserir tabela 3x3"
          icon="fa-table"
          active={editor.isActive("table")}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        <ToolbarDivider />
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

      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="unilio-article-editor__file-input"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void insertImageFromFile(file);
        }}
      />

      <EditorContent editor={editor} className="unilio-article-editor__content" style={{ minHeight }} />
    </div>
  );
}
