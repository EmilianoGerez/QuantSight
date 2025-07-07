import getFullSnapshot from "@/application/use-case/getFullSnapshot";
import { OptionRow } from "@/domain/model/option-row.model";
import { IAlpacaRepository } from "@/domain/repository/alpaca.repository";
import { AlpacaOptionsChainResponse } from "@/infrastructure/contract/alpaca-options-snapshots.contract";

jest.mock("@/domain/model/option-row.model", () => ({
  OptionRow: {
    fromSnapshot: jest.fn((optionSymbol, snapshot) => ({
      optionSymbol,
      ...snapshot,
    })),
  },
}));

describe("getFullSnapshot", () => {
  let alpacaRepository: jest.Mocked<IAlpacaRepository>;

  beforeEach(() => {
    alpacaRepository = {
      getOptionsChain: jest.fn(),
    } as any;
    jest.clearAllMocks();
  });

  it("fetches a single page and returns mapped OptionRows", async () => {
    const mockResponse: AlpacaOptionsChainResponse = {
      snapshots: {
        OPT1: { price: 10 },
        OPT2: { price: 20 },
      },
      next_page_token: undefined,
    };
    alpacaRepository.getOptionsChain.mockResolvedValueOnce(mockResponse);

    const result = await getFullSnapshot("AAPL", alpacaRepository);

    expect(alpacaRepository.getOptionsChain).toHaveBeenCalledWith(
      "AAPL",
      undefined
    );
    expect(result).toEqual([
      { optionSymbol: "OPT1", price: 10 },
      { optionSymbol: "OPT2", price: 20 },
    ]);
  });

  it("fetches multiple pages and concatenates all OptionRows", async () => {
    const page1: AlpacaOptionsChainResponse = {
      snapshots: { OPT1: { price: 10 } },
      next_page_token: "token1",
    };
    const page2: AlpacaOptionsChainResponse = {
      snapshots: { OPT2: { price: 20 } },
      next_page_token: undefined,
    };
    alpacaRepository.getOptionsChain
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const result = await getFullSnapshot("AAPL", alpacaRepository);

    expect(alpacaRepository.getOptionsChain).toHaveBeenCalledTimes(2);
    expect(alpacaRepository.getOptionsChain).toHaveBeenNthCalledWith(
      1,
      "AAPL",
      undefined
    );
    expect(alpacaRepository.getOptionsChain).toHaveBeenNthCalledWith(
      2,
      "AAPL",
      "token1"
    );
    expect(result).toEqual([
      { optionSymbol: "OPT1", price: 10 },
      { optionSymbol: "OPT2", price: 20 },
    ]);
  });

  it("handles empty snapshots", async () => {
    const mockResponse: AlpacaOptionsChainResponse = {
      snapshots: {},
      next_page_token: undefined,
    };
    alpacaRepository.getOptionsChain.mockResolvedValueOnce(mockResponse);

    const result = await getFullSnapshot("AAPL", alpacaRepository);

    expect(result).toEqual([]);
  });

  it("calls OptionRow.fromSnapshot for each snapshot", async () => {
    const mockResponse: AlpacaOptionsChainResponse = {
      snapshots: {
        OPT1: { price: 10 },
        OPT2: { price: 20 },
      },
      next_page_token: undefined,
    };
    alpacaRepository.getOptionsChain.mockResolvedValueOnce(mockResponse);

    await getFullSnapshot("AAPL", alpacaRepository);

    expect(OptionRow.fromSnapshot).toHaveBeenCalledTimes(2);
    expect(OptionRow.fromSnapshot).toHaveBeenCalledWith("OPT1", { price: 10 });
    expect(OptionRow.fromSnapshot).toHaveBeenCalledWith("OPT2", { price: 20 });
  });
});
