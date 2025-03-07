import { Blaze, Provider, Wallet } from "@blaze-cardano/sdk";
import { SundaeSDK } from "@sundaeswap/core";
import { MockAll, setupBlaze } from "@sundaeswap/core/testing";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "bun:test";

import Actions from "../components/Actions";
import { AppStateProvider } from "../state/context";

MockAll();

let blazeInstance: Blaze<Provider, Wallet>;

setupBlaze(async (blaze) => {
  blazeInstance = blaze;
});

describe.skip("Example testing", () => {
  it("should use the mocked SundaeSDK", async () => {
    const MockedSDK = await SundaeSDK.new({
      wallet: {
        name: "eternl",
        network: "preview",
        blazeInstance
      },
    });

    const { container, getByText } = render(
      <AppStateProvider defaultValue={{ SDK: MockedSDK }}>
        <Actions />
      </AppStateProvider>,
    );

    const swapButton = getByText("Swap tINDY for tADA");
    expect(swapButton).not.toBeNull();

    fireEvent.click(swapButton);
    await waitFor(() => {
      expect(MockedSDK.query).toHaveBeenCalledTimes(1);
      expect(MockedSDK.builder().swap).toHaveBeenCalledTimes(1);
    });

    expect(container).toMatchSnapshot();
  });
});
