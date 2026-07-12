import { describe, expect, it } from "vitest";
import {
  documentsLibraryApiUrl,
  documentsLibraryQueryKey,
  parseDocumentsLibraryQuery,
} from "@/lib/documents/documents-library.query";

describe("documents library query", () => {
  it("normalizes missing and invalid values", () => {
    const values = new Map([
      ["page", "0"],
      ["pageSize", "bad"],
      ["search", " resume "],
    ]);

    expect(parseDocumentsLibraryQuery((key) => values.get(key))).toEqual({
      page: 1,
      pageSize: 10,
      search: "resume",
      status: "all",
      type: "all",
      fidelity: "all",
      sort: "lastUpdated",
      tab: "all",
    });
  });

  it("uses every query dimension in the client cache key and API URL", () => {
    const query = {
      page: 2,
      pageSize: 25,
      search: "resume",
      status: "ready",
      type: "pdf",
      fidelity: "Plain Text Only",
      sort: "name",
      tab: "archived",
    };

    expect(documentsLibraryQueryKey(query)).toEqual([
      "documents-library",
      query,
    ]);
    expect(documentsLibraryApiUrl(query)).toContain("page=2");
    expect(documentsLibraryApiUrl(query)).toContain("search=resume");
    expect(documentsLibraryApiUrl(query)).toContain(
      "fidelity=Plain+Text+Only",
    );
  });
});
