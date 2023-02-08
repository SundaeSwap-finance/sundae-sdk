import { MockedExports } from "@sundaeswap/sdk-core/testing";
MockedExports.MockAll();

import "@testing-library/jest-dom";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { AppStateProvider } from "../state/context";
import Actions from "../components/Actions";
import { SundaeSDK } from "@sundaeswap/sdk-core";
import {
  ProviderSundaeSwap,
  TxBuilderLucid,
} from "@sundaeswap/sdk-core/extensions";

describe("Example testing", () => {
  it("should use the mocked SundaeSDK", async () => {
    const MockedSDK = new SundaeSDK(
      new TxBuilderLucid(
        {
          network: "preview",
          wallet: "eternl",
          providerType: "blockfrost",
          blockfrost: {
            apiKey: "",
            url: "",
          },
        },
        new ProviderSundaeSwap("preview")
      )
    );

    const { container, getByText } = render(
      <AppStateProvider defaultValue={{ SDK: MockedSDK }}>
        <Actions />
      </AppStateProvider>
    );

    const swapButton = getByText("Swap tINDY for tADA");
    expect(swapButton).toBeInTheDocument();

    fireEvent.click(swapButton);
    await waitFor(() => {
      expect(MockedExports.SundaeSDK.mockQuery).toHaveBeenCalledTimes(1);
      expect(MockedExports.SundaeSDK.mockSwap).toHaveBeenCalledTimes(1);
    });

    expect(container).toMatchSnapshot();
  });
});
