import React, { useEffect, useState } from "react";
import GenerateUserKey from "./nillion/components/reusable/GenerateUserKey";
import CreateClient from "./nillion/components/reusable/CreateClient";
import * as nillion from "@nillion/client-web";
import { NillionClient, NadaValues } from "@nillion/client-web";
import ComputeForm from "./nillion/components/reusable/ComputeForm";
import HeartDiseaseFormComponent from "./nillion/components/HeartDiseaseForm";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";

export interface SimpleDialogProps {
  open: boolean;
  result: string;
  onClose: (value: string) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, result, open } = props;

  const handleClose = () => {
    onClose('');
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Result</DialogTitle>
      <div style={{ margin: "2rem" }}>
        <Typography variant="body1">
          You have &nbsp;
          <b>{Math.round(+result * 100)}%</b>
          &nbsp; chance of developing heart disease
        </Typography>
      </div>
    </Dialog>
  );
}

export default function BlindInferencePage() {
  const programName = "heart-disease";
  const programId =
    "3rgqxWd47e171EUwe4RXP9hm45tmoXfuF8fC52S7jcFoQTnU8wPiL7hqWzyV1muak6bEg7iWhudwg4t2pM9XnXcp/heart-disease";
  const partyName_model_state = "Provider";
  const partyId_model_state =
    "12D3KooWJHrXiK2JTCjJxwCCktJPSYsUsz2WHEBSB5iZtqGiZ8Qm";
  const storeId_model_state = "48270fa2-d931-40fd-afef-fef86aaa205f";

  const partyName = "User";
  const defaultUserKeySeed = "my_seed";
  const outputName = "logit_0";

  const [userkey, setUserKey] = useState<string | null>(null);
  const [client, setClient] = useState<NillionClient | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [additionalComputeValues, setAdditionalComputeValues] =
    useState<NadaValues | null>(null);
  const [computeResult, setComputeResult] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleClose = (value: string) => {
    setShowDialog(false);
  };

  useEffect(() => {
    if (userkey && client) {
      setUserId(client.user_id);
      setPartyId(client.party_id);
    }
  }, [userkey, client]);

  const handleInputFeatureDataSet = (inputFeatureDataSet: any) => {
    const additionalComputeValues = new nillion.NadaValues();

    Object.keys(inputFeatureDataSet).forEach((key) => {
      const value = inputFeatureDataSet[key];
      additionalComputeValues.insert(
        key,
        nillion.NadaValue.new_secret_integer(
          Math.round(value === 0 ? 1 : value * Math.pow(2, 16)).toString()
        )
      );
    });

    setAdditionalComputeValues(additionalComputeValues);
  };

  const handleComputeResult = (result: any) => {
    // const rescaledResult = parseFloat(result.value) / Math.pow(2, 16);
    console.log(result);
    setComputeResult(result.toString());
    setShowDialog(true);
  };

  return (
    <div style={{ marginBottom: "4rem" }}>
      <h1>Heart Health Diagnosis</h1>
      <p>
        Fill out this form to find out if you might have hearth disease
        <br />
      </p>
      <br />

      <h1>1. Connect to Nillion Client {client && " ✅"}</h1>
      <GenerateUserKey
        setUserKey={setUserKey}
        defaultUserKeySeed={defaultUserKeySeed}
      />

      {userkey && <CreateClient userKey={userkey} setClient={setClient} />}

      <br />
      <h1>2. Fill out your form</h1>
      {
        <HeartDiseaseFormComponent
          setData={handleInputFeatureDataSet}
          disabled={!client}
        />
      }
      {client &&
        programId &&
        storeId_model_state &&
        partyId &&
        additionalComputeValues && (
          <ComputeForm
            shouldRescale
            nillionClient={client}
            programId={programId}
            additionalComputeValues={additionalComputeValues}
            storeIds={[storeId_model_state]}
            inputParties={[
              // Party0
              {
                partyName: partyName_model_state,
                partyId: partyId_model_state,
              },
              // Party1
              {
                partyName,
                partyId,
              },
            ]}
            outputParties={[{ partyName, partyId }]}
            outputName={outputName}
            onComputeProgram={handleComputeResult}
          />
        )}
      <SimpleDialog
        result={computeResult as string}
        open={showDialog}
        onClose={handleClose}
        
      />
    </div>
  );
}
