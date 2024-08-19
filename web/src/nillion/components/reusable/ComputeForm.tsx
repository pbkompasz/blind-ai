import React, { useState } from "react";
import * as nillion from "@nillion/client-web";
import { getQuote } from "../../helpers/getQuote";
import {
  createNilChainClientAndWalletFromPrivateKey,
  payWithWalletFromPrivateKey,
} from "../../helpers/nillion";
import { computeProgram } from "../../helpers/compute";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
} from "@mui/material";
import PayButton from "./PayButton";

interface ComputeParty {
  partyName: string;
  partyId: string;
}

interface ComputeProgramProps {
  shouldRescale?: boolean;
  nillionClient: nillion.NillionClient;
  programId: string;
  additionalComputeValues: nillion.NadaValues;
  storeIds: string[];
  inputParties: ComputeParty[];
  outputParties: ComputeParty[];
  outputName: string;
  onComputeProgram?: (data: any) => void;
}

const ComputeComponent: React.FC<ComputeProgramProps> = ({
  shouldRescale = false,
  nillionClient,
  programId,
  additionalComputeValues,
  storeIds,
  inputParties,
  outputParties,
  outputName,
  onComputeProgram,
}: ComputeProgramProps) => {
  const [quote, setQuote] = useState<any | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<any | null>(null);
  const [computeResult, setComputeResult] = useState<any | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const handleGetQuoteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (nillionClient) {
      setLoadingQuote(true);
      await nillion.default();

      const operation = nillion.Operation.compute(
        programId,
        additionalComputeValues
      );
      const quote = await getQuote({
        client: nillionClient,
        operation,
      });

      setQuote({
        quote,
        quoteJson: quote.toJSON(),
        operation,
      });
      setLoadingQuote(false);
    }
  };

  const handlePayAndCompute = async () => {
    if (nillionClient && quote?.operation) {
      setLoadingPayment(true);
      const [nilChainClient, nilChainWallet] =
        await createNilChainClientAndWalletFromPrivateKey();

      const paymentReceipt = await payWithWalletFromPrivateKey(
        nilChainClient,
        nilChainWallet,
        quote
      );

      setPaymentReceipt(paymentReceipt);

      const value = await computeProgram({
        nillionClient,
        receipt: paymentReceipt,
        programId,
        storeIds,
        inputParties,
        outputParties,
        outputName,
        additionalComputeValues,
      });

      setComputeResult(1 / (1 + Math.exp(-value)));
      if (onComputeProgram) {
        onComputeProgram({ value });
      }

      if (shouldRescale) {
        const rescaledResult = parseFloat(value) / Math.pow(2, 16);
        const probabilityResult = 1 / (1 + Math.exp(-rescaledResult));
        console.log(probabilityResult)
        if (onComputeProgram) {
          onComputeProgram(probabilityResult);
        }
        setComputeResult(rescaledResult);
      }

      setLoadingPayment(false);
    }
  };

  return (
    <Stack
      component="form"
      onSubmit={handleGetQuoteSubmit}
      sx={{ mt: 2 }}
      direction="row"
      gap={2}
      alignItems="center"
    >
      <Button type="submit" variant="contained" color="primary">
        Get Computation Quote{" "}
        {loadingQuote && (
          <CircularProgress
            size="14px"
            color="inherit"
            style={{ marginLeft: "10px" }}
          />
        )}
      </Button>
      {quote && (
        <PayButton
          buttonText="Pay and compute"
          onClick={handlePayAndCompute}
          loading={loadingPayment}
          displayList={!!computeResult}
        />
      )}
    </Stack>
  );
};

export default ComputeComponent;
