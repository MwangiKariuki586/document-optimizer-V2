import { Extension } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export type SuggestionHighlightRange = {
  id: string;
  from: number;
  to: number;
  category: SuggestionHighlightCategory;
  issueLabel: string;
};

type SuggestionHighlightInput = {
  id: string;
  originalText: string;
  category: SuggestionHighlightCategory;
  issueLabel: string;
};

export type SuggestionHighlightCategory =
  | "clarity"
  | "conciseness"
  | "formatting"
  | "grammar"
  | "structure"
  | "tone";

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
            ? `suggestion-highlight suggestion-highlight-${range.category} is-active`
            : `suggestion-highlight suggestion-highlight-${range.category}`,
        "data-suggestion-id": range.id,
        "data-suggestion-category": range.category,
        title: `${range.issueLabel} (${range.category})`,
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
      category: range.category,
      issueLabel: range.issueLabel,
    }))
    .filter((range) => range.from < range.to && range.to <= doc.content.size);
}

function normalizeSearchText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function createNormalizedDocumentIndex(doc: ProseMirrorNode) {
  let text = "";
  const positionMap: number[] = [];
  let previousWasSpace = true;
  let previousTextEnd: number | null = null;

  doc.descendants((node, position) => {
    if (!node.isText || !node.text) {
      return true;
    }

    if (
      previousTextEnd !== null &&
      position > previousTextEnd &&
      !previousWasSpace
    ) {
      text += " ";
      positionMap.push(position);
      previousWasSpace = true;
    }

    for (let offset = 0; offset < node.text.length; offset += 1) {
      const character = node.text[offset];

      if (!character) {
        continue;
      }

      if (/\s/.test(character)) {
        if (!previousWasSpace) {
          text += " ";
          positionMap.push(position + offset);
          previousWasSpace = true;
        }

        continue;
      }

      text += character;
      positionMap.push(position + offset);
      previousWasSpace = false;
    }

    previousTextEnd = position + node.text.length;

    return true;
  });

  return {
    text: text.trim(),
    positionMap: previousWasSpace ? positionMap.slice(0, -1) : positionMap,
  };
}

export function findSuggestionHighlightRanges(
  doc: ProseMirrorNode,
  suggestions: SuggestionHighlightInput[],
): SuggestionHighlightRange[] {
  const ranges: SuggestionHighlightRange[] = [];
  const documentIndex = createNormalizedDocumentIndex(doc);

  for (const suggestion of suggestions) {
    const snippet = normalizeSearchText(suggestion.originalText);

    if (snippet.length === 0) {
      continue;
    }

    const snippetIndex = documentIndex.text.indexOf(snippet);

    if (snippetIndex < 0) {
      continue;
    }

    const from = documentIndex.positionMap[snippetIndex];
    const lastPosition =
      documentIndex.positionMap[snippetIndex + snippet.length - 1];

    if (from === undefined || lastPosition === undefined) {
      continue;
    }

    ranges.push({
      id: suggestion.id,
      from,
      to: lastPosition + 1,
      category: suggestion.category,
      issueLabel: suggestion.issueLabel,
    });
  }

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
