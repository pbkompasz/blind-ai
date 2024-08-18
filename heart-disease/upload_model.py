import asyncio
import os
import json

from dotenv import load_dotenv
from py_nillion_client import NodeKey, UserKey
from nillion_python_helpers import create_nillion_client, create_payments_config
import joblib
import nada_numpy as na
import py_nillion_client as nillion
from cosmpy.aerial.client import LedgerClient
from cosmpy.aerial.wallet import LocalWallet
from cosmpy.crypto.keypairs import PrivateKey
from dotenv import load_dotenv
from nada_ai.client import SklearnClient

from common import store_program, store_secrets


MODEL_PATH = 'model/heart-disease.joblib'
OUT_PATH = 'out.json'

home = os.getenv("HOME")
if os.getenv("ENV") == "PROD":
  print("Uploading to testnet")
  load_dotenv("../.env")
else:
  print("Uploading to local devnet")
  load_dotenv(f"{home}/.config/nillion/nillion-devnet.env")
  

async def main() -> None:
    """Main nada program"""
    cluster_id = os.getenv("NILLION_CLUSTER_ID")
    grpc_endpoint = os.getenv("NILLION_NILCHAIN_GRPC")
    chain_id = os.getenv("NILLION_NILCHAIN_CHAIN_ID")
    private_key = os.getenv("NILLION_NILCHAIN_PRIVATE_KEY_0")
    seed = "my_seed"
    model_provider_userkey = UserKey.from_seed((seed))
    model_provider_nodekey = NodeKey.from_seed((seed))
    model_provider_client = create_nillion_client(
        model_provider_userkey, model_provider_nodekey
    )
    model_provider_party_id = model_provider_client.party_id
    model_provider_user_id = model_provider_client.user_id

    program_name = "heart-disease"
    program_mir_path = f"target/{program_name}.nada.bin"

    payments_config = create_payments_config(chain_id, grpc_endpoint)
    payments_client = LedgerClient(payments_config)
    payments_wallet = LocalWallet(
        PrivateKey(bytes.fromhex(private_key)),
        prefix="nillion",
    )

    print("Storing program...")

    program_id = await store_program(
        model_provider_client,
        payments_wallet,
        payments_client,
        model_provider_user_id,
        cluster_id,
        program_name,
        program_mir_path,
    )

    print("Program stored successfully!")

    classifier = joblib.load(MODEL_PATH)

    model_client = SklearnClient(classifier)

    model_secrets = nillion.NadaValues(
        model_client.export_state_as_secrets("my_model", na.SecretRational)
    )
    permissions = nillion.Permissions.default_for_user(model_provider_client.user_id)
    permissions.add_compute_permissions({model_provider_client.user_id: {program_id}})

    print("Storing model...")

    model_store_id = await store_secrets(
        model_provider_client,
        payments_wallet,
        payments_client,
        cluster_id,
        model_secrets,
        1,
        permissions,
    )

    print("Model stored successfully!")

    # This information is needed by the model user
    with open(OUT_PATH, "w") as provider_variables_file:
        provider_variables = {
            "program_id": program_id,
            "model_store_id": model_store_id,
            "model_provider_party_id": model_provider_party_id,
        }
        json.dump(provider_variables, provider_variables_file)



if __name__ == "__main__":
    asyncio.run(main())