import { Extension } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export type SuggestionHighlightRange = {
  id: string;
  from: number;
  to: number;
};

type SuggestionHighlightInput = {
  id: string;
  originalText: string;
};

type SuggestionHighlightState = {
  ranges: SuggestionHighlightRange[];
  activeId: string | null;
  decorations: DecorationSet;
};

type SuggestionHighlightMeta =
  | {
      type: "set-ranges";
      ranges: SuggestionHighlightRange[];
    }
  | {
      type: "set-active";
      activeId: string | null;
    };

type SuggestionHighlightOptions = {
  onHighlightClick?: (suggestionId: string) => void;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    suggestionHighlight: {
      setSuggestionHighlights: (
        ranges: SuggestionHighlightRange[],
      ) => ReturnType;
      setActiveSuggestionHighlight: (suggestionId: string | null) => ReturnType;
    };
  }
}

export const suggestionHighlightPluginKey =
  new PluginKey<SuggestionHighlightState>("suggestionHighlight");

function buildDecorations(
  doc: ProseMirrorNode,
  ranges: SuggestionHighlightRange[],
  activeId: string | null,
): DecorationSet {
  return DecorationSet.create(
    doc,
    ranges.map((range) =>
      Decoration.inline(range.from, range.to, {
        class:
          range.id === activeId
            ? "suggestion-highlight is-active"
            : "suggestion-highlight",
        "data-suggestion-id": range.id,
      }),
    ),
  );
}

function mapRanges(
  ranges: SuggestionHighlightRange[],
  mapping: Parameters<DecorationSet["map"]>[0],
  doc: ProseMirrorNode,
): SuggestionHighlightRange[] {
  return ranges
    .map((range) => ({
      id: range.id,
      from: mapping.map(range.from),
      to: mapping.map(range.to),
    }))
    .filter((range) => range.from < range.to && range.to <= doc.content.size);
}

export function findSuggestionHighlightRanges(
  doc: ProseMirrorNode,
  suggestions: SuggestionHighlightInput[],
): SuggestionHighlightRange[] {
  const ranges: SuggestionHighlightRange[] = [];
  const pending = new Map(
    suggestions
      .filter((suggestion) => suggestion.originalText.trim().length > 0)
      .map((suggestion) => [
        suggestion.id,
        suggestion.originalText.replace(/\s+/g, " ").trim(),
      ]),
  );

  doc.descendants((node, position) => {
    if (!node.isText || !node.text || pending.size === 0) {
      return true;
    }

    const normalizedText = node.text.replace(/\s+/g, " ");

    for (const [id, snippet] of pending.entries()) {
      const snippetIndex = normalizedText.indexOf(snippet);

      if (snippetIndex < 0) {
        continue;
      }

      ranges.push({
        id,
        from: position + snippetIndex,
        to: position + snippetIndex + snippet.length,
      });
      pending.delete(id);
    }

    return true;
  });

  return ranges;
}

export const SuggestionHighlight = Extension.create<SuggestionHighlightOptions>({
  name: "suggestionHighlight",

  addOptions() {
    return {};
  },

  addCommands() {
    return {
      setSuggestionHighlights:
        (ranges) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(suggestionHighlightPluginKey, {
              type: "set-ranges",
              ranges,
            } satisfies SuggestionHighlightMeta);
          }

          return true;
        },
      setActiveSuggestionHighlight:
        (activeId) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(suggestionHighlightPluginKey, {
              type: "set-active",
              activeId,
            } satisfies SuggestionHighlightMeta);
          }

          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin<SuggestionHighlightState>({
        key: suggestionHighlightPluginKey,
        state: {
          init: (_, state) => ({
            ranges: [],
            activeId: null,
            decorations: DecorationSet.create(state.doc, []),
          }),
          apply: (tr, value, _oldState, newState) => {
            const meta = tr.getMeta(
              suggestionHighlightPluginKey,
            ) as SuggestionHighlightMeta | undefined;

            if (meta?.type === "set-ranges") {
              return {
                ranges: meta.ranges,
                activeId: value.activeId,
                decorations: buildDecorations(
                  newState.doc,
                  meta.ranges,
                  value.activeId,
                ),
              };
            }

            if (meta?.type === "set-active") {
              return {
                ranges: value.ranges,
                activeId: meta.activeId,
                decorations: buildDecorations(
                  newState.doc,
                  value.ranges,
                  meta.activeId,
                ),
              };
            }

            if (tr.docChanged) {
              const mappedRanges = mapRanges(
                value.ranges,
                tr.mapping,
                newState.doc,
              );

              return {
                ranges: mappedRanges,
                activeId: value.activeId,
                decorations: buildDecorations(
                  newState.doc,
                  mappedRanges,
                  value.activeId,
                ),
              };
            }

            return value;
          },
        },
        props: {
          decorations(state) {
            return suggestionHighlightPluginKey.getState(state)?.decorations;
          },
          handleClick(_view, _position, event) {
            const target = event.target;

            if (!(target instanceof HTMLElement)) {
              return false;
            }

            const highlight = target.closest<HTMLElement>(
              "[data-suggestion-id]",
            );
            const suggestionId = highlight?.dataset.suggestionId;

            if (!suggestionId) {
              return false;
            }

            options.onHighlightClick?.(suggestionId);

            return false;
          },
        },
      }),
    ];
  },
});
