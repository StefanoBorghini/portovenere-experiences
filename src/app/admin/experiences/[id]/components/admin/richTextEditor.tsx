"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface Props {

    value: string;

    onChange: (value: string) => void;

}

export default function RichTextEditor({

    value,

    onChange,

}: Props) {

    const editor = useEditor({

        extensions: [

            StarterKit,

        ],

        content: value,

        immediatelyRender: false,

        onUpdate({ editor }) {

            onChange(
                editor.getHTML()
            );

        },

    });

    useEffect(() => {

        if (

            editor &&

            editor.getHTML() !== value

        ) {

            editor.commands.setContent(value);

        }

    }, [value, editor]);

    if (!editor) return null;

    return (

        <div
            className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            overflow-hidden
            "
        >

            <div
                className="
                flex
                gap-2
                p-3
                border-b
                border-white/10
                "
            >

                <button

                    onClick={()=>
                        editor.chain().focus().toggleBold().run()
                    }

                    className="px-3 py-1 rounded bg-white/10"

                >

                    B

                </button>

                <button

                    onClick={()=>
                        editor.chain().focus().toggleItalic().run()
                    }

                    className="px-3 py-1 rounded bg-white/10"

                >

                    I

                </button>

                <button

                    onClick={()=>
                        editor.chain().focus().toggleBulletList().run()
                    }

                    className="px-3 py-1 rounded bg-white/10"

                >

                    •

                </button>

                <button

                    onClick={()=>
                        editor.chain().focus().toggleOrderedList().run()
                    }

                    className="px-3 py-1 rounded bg-white/10"

                >

                    1.

                </button>

            </div>

            <EditorContent

                editor={editor}

                className="
                min-h-[180px]
                p-5
                prose
                prose-invert
                max-w-none
                "

            />

        </div>

    );

}