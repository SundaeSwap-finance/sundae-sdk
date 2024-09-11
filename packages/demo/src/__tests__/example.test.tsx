import { ETxBuilderType, SundaeSDK } from "@sundaeswap/core";
import { MockAll, setupLucid } from "@sundaeswap/core/testing";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "bun:test";
import { Lucid } from "lucid-cardano";

MockAll();

let lucidInstance: Lucid;

setupLucid(async (lucid) => {
  lucidInstance = lucid;
});

import Actions from "../components/Actions";
import { AppStateProvider } from "../state/context";

describe.skip("Example testing", () => {
  it("should use the mocked SundaeSDK", async () => {
    const MockedSDK = await SundaeSDK.new({
      wallet: {
        builder: {
          type: ETxBuilderType.LUCID,
          lucid: lucidInstance,
        },
        name: "eternl",
        network: "preview",
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
