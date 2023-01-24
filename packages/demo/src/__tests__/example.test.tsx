import { Mocks } from "@sundaeswap/sdk-core/testing";
Mocks.MockExports();

import "@testing-library/jest-dom";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { AppStateProvider } from "../state/context";
import Actions from "../components/Actions";
import { SundaeSDK } from "@sundaeswap/sdk-core";
import {
  ProviderSundaeSwap,
  TxBuilderLucid,
} from "@sundaeswap/sdk-core/extensions";

console.log = jest.fn();

describe("Example testing", () => {
  it("should use the mocked SundaeSDK", async () => {
    const MockedSDK = new SundaeSDK(
      new TxBuilderLucid(
        {
          network: "preview",
          wallet: "eternl",
          provider: "blockfrost",
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
      expect(Mocks.SundaeSDK.mockQuery).toHaveBeenCalledTimes(1);
      expect(Mocks.SundaeSDK.mockSwap).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledTimes(2);
    });

    expect(container).toMatchSnapshot();
  });
});
