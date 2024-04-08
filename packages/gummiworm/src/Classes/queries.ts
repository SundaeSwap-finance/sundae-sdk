import { gql } from "graphql-request";

const AssetFragment = gql`
    fragment on Asset {
        asset {
            id: assetId
        }
        amount {
            quantity
        }
    }
`;

const UtxoFragment = gql`
    fragment on Utxo {
        txHash
        outputIndex
        asset {
            ...${AssetFragment}
        }
        address
        datumHash
        datum
        scriptRef
    }
`;

export const GetUtxosQuery = gql`
    query($address: String!) {
        getUtxos(address: $address) {
            ...${UtxoFragment}
        }
    }
`;
