import { ETxBuilderType, SundaeSDK } from "@sundaeswap/core";
import { MockAll, setupLucid } from "@sundaeswap/core/testing";
import "@testing-library/jest-dom";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Lucid } from "lucid-cardano";

MockAll();

let lucidInstance: Lucid;

setupLucid((lucid) => {
  lucidInstance = lucid;
});

import { Home } from "../components/Actions/Home";
import { AppStateProvider } from "../state/context";

describe("Example testing", () => {
  it("should use the mocked SundaeSDK", async () => {
    const MockedSDK = new SundaeSDK({
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
        <Home />
      </AppStateProvider>
    );

    const swapButton = getByText("Swap tINDY for tADA");
    expect(swapButton).toBeInTheDocument();

    fireEvent.click(swapButton);
    await waitFor(() => {
      expect(MockedSDK.query).toHaveBeenCalledTimes(1);
      expect(MockedSDK.builder().swap).toHaveBeenCalledTimes(1);
    });

    expect(container).toMatchSnapshot();
  });
});
