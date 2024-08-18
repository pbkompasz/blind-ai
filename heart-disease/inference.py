"""Run model inference"""

import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.getcwd(), os.pardir)))

import asyncio
import json
import math

import nada_numpy as na
import nada_numpy.client as na_client
import numpy as np
import py_nillion_client as nillion
from cosmpy.aerial.client import LedgerClient
from cosmpy.aerial.wallet import LocalWallet
from cosmpy.crypto.keypairs import PrivateKey
from dotenv import load_dotenv
from nillion_python_helpers import create_nillion_client, create_payments_config
from py_nillion_client import NodeKey, UserKey

from common import compute, store_secret_array

home = os.getenv("HOME")
if os.getenv("ENV") == "PROD":
  print("Running inference on testnet")
  load_dotenv("../.env")
else:
  print("Running inference on local devnet")
  load_dotenv(f"{home}/.config/nillion/nillion-devnet.env")

IN_PATH = 'out.json'

async def main() -> None:
    """Main nada program"""

    cluster_id = os.getenv("NILLION_CLUSTER_ID")
    grpc_endpoint = os.getenv("NILLION_NILCHAIN_GRPC")
    chain_id = os.getenv("NILLION_NILCHAIN_CHAIN_ID")
    seed = "my_seed"
    model_user_userkey = UserKey.from_seed((seed))
    model_user_nodekey = NodeKey.from_seed((seed))
    model_user_client = create_nillion_client(model_user_userkey, model_user_nodekey)
    model_user_party_id = model_user_client.party_id

    payments_config = create_payments_config(chain_id, grpc_endpoint)
    payments_client = LedgerClient(payments_config)
    payments_wallet = LocalWallet(
        PrivateKey(bytes.fromhex(os.getenv("NILLION_NILCHAIN_PRIVATE_KEY_0"))),
        prefix="nillion",
    )

    # This information was provided by the model provider
    with open(IN_PATH, "r") as provider_variables_file:
        provider_variables = json.load(provider_variables_file)

    program_id = provider_variables["program_id"]
    model_store_id = provider_variables["model_store_id"]
    model_provider_party_id = provider_variables["model_provider_party_id"]

    features = np.array([0.72, 1, 0, 0.675, 0, 0, 1, 0.41176471, 1, 0.54166667, 0.5])

    permissions = nillion.Permissions.default_for_user(model_user_client.user_id)
    permissions.add_compute_permissions({model_user_client.user_id: {program_id}})

    print("Storing input data...")

    features_store_id = await store_secret_array(
        model_user_client,
        payments_wallet,
        payments_client,
        cluster_id,
        features,
        "my_input",
        na.SecretRational,
        1,
        permissions,
    )

    print("Input data stored successfully!")

    compute_bindings = nillion.ProgramBindings(program_id)

    compute_bindings.add_input_party("Provider", model_provider_party_id)
    compute_bindings.add_input_party("User", model_user_party_id)
    compute_bindings.add_output_party("User", model_user_party_id)

    result = await compute(
        model_user_client,
        payments_wallet,
        payments_client,
        program_id,
        cluster_id,
        compute_bindings,
        [model_store_id, features_store_id],
        nillion.NadaValues({}),
        verbose=True,
    )

    logit = na_client.float_from_rational(result["logit_0"])
    print("Computed logit is", logit)

    def sigmoid(x):
        return 1 / (1 + math.exp(-x))

    output_probability = sigmoid(logit)

    print("Which corresponds to probability", output_probability)


if __name__ == "__main__":
    asyncio.run(main())