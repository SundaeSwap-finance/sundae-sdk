import { ILockArguments } from "../../../@types/configs.js";
import { TDelegation } from "../../../@types/lucid.js";
import { delegation } from "../../__data__/delegationData.lucid.js";

const ownerAddress =
  "addr_test1qrp8nglm8d8x9w783c5g0qa4spzaft5z5xyx0kp495p8wksjrlfzuz6h4ssxlm78v0utlgrhryvl2gvtgp53a6j9zngqtjfk6s";

export const EXPECTATIONS = {
  buildLockDatum: [
    {
      args: {
        owner: {
          address: ownerAddress,
        },
        programs: [],
      } as ILockArguments<TDelegation>["delegation"],
      expectations: {
        inline:
          "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff80ff",
        hash: "ae02f4c4c993de87d8cfbf6b870326a97a0f4f674ff66ed895af257ff572c311",
      },
    },
    {
      args: {
        owner: {
          address: ownerAddress,
        },
        programs: delegation,
      } as ILockArguments<TDelegation>["delegation"],
      expectations: {
        inline:
          "d8799fd8799f581c121fd22e0b57ac206fefc763f8bfa0771919f5218b40691eea4514d0ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff",
        hash: "29d4b994f2d4b29e34701e1dbc3e6e519684eaa808ff3944a6d646a74d86fcc4",
      },
    },
    {
      args: {
        owner: {
          address:
            "addr_test1vz5ykwgmrejk3mdw0u3cewqx375qkjwnv5n4mhgjwap4n4qrymjhv",
        },
        programs: delegation,
      } as ILockArguments<TDelegation>["delegation"],
      expectations: {
        inline:
          "d8799fd8799f581ca84b391b1e6568edae7f238cb8068fa80b49d365275ddd12774359d4ff9fd87a9f4574494e445941001864ffd87a9f44494e445941041837ffd87a9f44494e44594102182dffd87a9f4653424552525941021864ffffff",
        hash: "01cc77dfeda9247403f9c738c7f64d5afe08e659fe8707ef38b31327ff2d86d7",
      },
    },
  ],
};
