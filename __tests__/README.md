import getFullSnapshot from "./getFullSnapshot";
import { OptionRow } from "@/domain/model/option-row.model";
import { IAlpacaRepository } from "@/domain/repository/alpaca.repository";
import { AlpacaOptionsChainResponse } from "@/infrastructure/contract/alpaca-options-snapshots.contract";

// Frontend/MarketProject/market-analytics/src/application/use-case/getFullSnapshot.test.ts

jest.mock("@/domain/model/option-row.model", () => ({
  OptionRow: {
    fromSnapshot: jest.fn(),
  },
}));

describe("getFullSnapshot", () => {
  const mockGetOptionsChain = jest.fn();
  const mockAlpacaRepository: IAlpacaRepository = {
    getOptionsChain: mockGetOptionsChain,
  } as unknown as IAlpacaRepository;

  const mockOptionRow = (id: string) => ({ id } as unknown as OptionRow);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches a single page and returns mapped OptionRows", async () => {
    const response: AlpacaOptionsChainResponse = {
      snapshots: {
        OPT1: { foo: "bar1" },
        OPT2: { foo: "bar2" },
      },
      next_page_token: undefined,
    };
    mockGetOptionsChain.mockResolvedValueOnce(response);
    (OptionRow.fromSnapshot as jest.Mock)
      .mockReturnValueOnce(mockOptionRow("row1"))
      .mockReturnValueOnce(mockOptionRow("row2"));

    const result = await getFullSnapshot("AAPL", mockAlpacaRepository);

    expect(mockGetOptionsChain).toHaveBeenCalledWith("AAPL", undefined);
    expect(OptionRow.fromSnapshot).toHaveBeenCalledWith("OPT1", { foo: "bar1" });
    expect(OptionRow.fromSnapshot).toHaveBeenCalledWith("OPT2", { foo: "bar2" });
    expect(result).toEqual([mockOptionRow("row1"), mockOptionRow("row2")]);
  });

  it("fetches multiple pages and concatenates OptionRows", async () => {
    const response1: AlpacaOptionsChainResponse = {
      snapshots: { OPT1: { foo: "bar1" } },
      next_page_token: "token1",
    };
    const response2: AlpacaOptionsChainResponse = {
      snapshots: { OPT2: { foo: "bar2" } },
      next_page_token: undefined,
    };
    mockGetOptionsChain
      .mockResolvedValueOnce(response1)
      .mockResolvedValueOnce(response2);
    (OptionRow.fromSnapshot as jest.Mock)
      .mockReturnValueOnce(mockOptionRow("row1"))
      .mockReturnValueOnce(mockOptionRow("row2"));

    const result = await getFullSnapshot("AAPL", mockAlpacaRepository);

    expect(mockGetOptionsChain).toHaveBeenCalledWith("AAPL", undefined);
    expect(mockGetOptionsChain).toHaveBeenCalledWith("AAPL", "token1");
    expect(result).toEqual([mockOptionRow("row1"), mockOptionRow("row2")]);
  });

  it("handles empty snapshots", async () => {
    const response: AlpacaOptionsChainResponse = {
      snapshots: {},
      next_page_token: undefined,
    };
    mockGetOptionsChain.mockResolvedValueOnce(response);

    const result = await getFullSnapshot("AAPL", mockAlpacaRepository);

    expect(result).toEqual([]);
    expect(OptionRow.fromSnapshot).not.toHaveBeenCalled();
  });

  it("passes correct symbol and nextPageToken to repository", async () => {
    const response1: AlpacaOptionsChainResponse = {
      snapshots: {},
      next_page_token: "token1",
    };
    const response2: AlpacaOptionsChainResponse = {
      snapshots: {},
      next_page_token: undefined,
    };
    mockGetOptionsChain
      .mockResolvedValueOnce(response1)
      .mockResolvedValueOnce(response2);

    await getFullSnapshot("TSLA", mockAlpacaRepository);

    expect(mockGetOptionsChain).toHaveBeenNthCalledWith(1, "TSLA", undefined);
    expect(mockGetOptionsChain).toHaveBeenNthCalledWith(2, "TSLA", "token1");
  });
});