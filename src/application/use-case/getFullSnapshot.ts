import { IAlpacaRepository } from "@/domain/repository/alpaca.repository";
import { AlpacaOptionsChainResponse } from "@/infrastructure/contract/alpaca-options-snapshots.contract";
import { OptionRow } from "@/domain/model/option-row.model";

export default async function getFullSnapshot(
  symbol: string,
  alpacaRepository: IAlpacaRepository
): Promise<OptionRow[]> {
  let nextPageToken: string | undefined = undefined;
  const optionRows: OptionRow[] = [];

  do {
    const response: AlpacaOptionsChainResponse =
      await alpacaRepository.getOptionsChain(symbol, nextPageToken);
    const batch = Object.entries(response.snapshots).map(
      ([optionSymbol, snapshot]) =>
        OptionRow.fromSnapshot(optionSymbol, snapshot)
    );
    optionRows.push(...batch);
    nextPageToken = response.next_page_token;
  } while (nextPageToken);

  return optionRows;
}
