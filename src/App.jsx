import { useState } from "react";
import { Button, TextField, CircularProgress, Link } from "@mui/material";
import {
  Keypair,
  SorobanRpc,
  TransactionBuilder,
  Asset,
  Operation,
  LiquidityPoolAsset,
  getLiquidityPoolId,
  BASE_FEE,
  Networks,
} from "@stellar/stellar-sdk";
import toast, { Toaster } from "react-hot-toast";

const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");

function App() {
  const [keypair, setKeypair] = useState(null);
  // const [log, setLog] = useState("");
  const [liquidityPoolId, setLiquidityPoolId] = useState("");
  const [assetName, setAssetName] = useState("");
  const [fundSuccess, setFundSuccess] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createResult, setCreateResult] = useState();
  const [withdrawResult, setWithdrawResult] = useState();
  const [tokenAAmount, setTokenAAmount] = useState("");
  const [tokenBAmount, setTokenBAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState({
    generateKeypair: false,
    fundAccount: false,
    createLiquidityPool: false,
    withdrawFromPool: false,
  });

  // const addLog = (message) => {
  //   setLog(message);
  // };

  const generateKeypair = () => {
    setLoading((prev) => ({ ...prev, generateKeypair: true }));
    const newKeypair = Keypair.random();
    setKeypair(newKeypair);
    toast.success(`Generated new keypair`);
    setLoading((prev) => ({ ...prev, generateKeypair: false }));
  };

  const fundAccount = async () => {
    if (!keypair) {
      toast.error("Please generate a keypair first.");
      return;
    }

    setLoading((prev) => ({ ...prev, fundAccount: true }));
    const friendbotUrl = `https://friendbot.stellar.org?addr=${keypair.publicKey()}`;
    try {
      const response = await fetch(friendbotUrl);
      if (response.ok) {
        toast.success(`Account successfully funded.`);
        setFundSuccess(true);
      } else {
        toast.error(`Something went wrong funding account.`);
      }
    } catch (error) {
      toast.error(`Error funding account: ${error.message}`);
    }
    setLoading((prev) => ({ ...prev, fundAccount: false }));
  };

  const createLiquidityPool = async () => {
    if (!keypair || !assetName || !tokenAAmount || !tokenBAmount) {
      toast.error(
        "Please ensure you have a keypair, asset name, and token amounts."
      );
      return;
    }

    setLoading((prev) => ({ ...prev, createLiquidityPool: true }));
    try {
      const account = await server.getAccount(keypair.publicKey());
      const customAsset = new Asset(assetName, keypair.publicKey());
      const lpAsset = new LiquidityPoolAsset(Asset.native(), customAsset, 30);
      const lpId = getLiquidityPoolId("constant_product", lpAsset).toString(
        "hex"
      );
      setLiquidityPoolId(lpId);

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.changeTrust({ asset: lpAsset }))
        .addOperation(
          Operation.liquidityPoolDeposit({
            liquidityPoolId: lpId,
            maxAmountA: tokenAAmount,
            maxAmountB: tokenBAmount,
            minPrice: { n: 1, d: 1 },
            maxPrice: { n: 1, d: 1 },
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const result = await server.sendTransaction(transaction);
      setCreateSuccess(true);
      setCreateResult(result);
      toast.success(`Liquidity Pool created`);
    } catch (error) {
      toast.error(`Error creating Liquidity Pool: ${error.message}`);
    }
    setLoading((prev) => ({ ...prev, createLiquidityPool: false }));
  };

  const withdrawFromPool = async () => {
    if (!keypair || !liquidityPoolId || !withdrawAmount) {
      toast.error(
        "Please ensure you have a keypair, liquidity pool ID, and withdrawal amount."
      );
      return;
    }

    setLoading((prev) => ({ ...prev, withdrawFromPool: true }));
    try {
      const account = await server.getAccount(keypair.publicKey());
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.liquidityPoolWithdraw({
            liquidityPoolId: liquidityPoolId,
            amount: withdrawAmount,
            minAmountA: "0",
            minAmountB: "0",
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const result = await server.sendTransaction(transaction);
      setWithdrawResult(result);
      toast.success("Withdrawal successful.");
    } catch (error) {
      toast.error(`Error withdrawing from Liquidity Pool: ${error.message}`);
    }
    setLoading((prev) => ({ ...prev, withdrawFromPool: false }));
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center overflow-scroll text-black ">
      <div className="p-10 border w-[70%] overflow-scroll max-h-[90%] shadow-lg bg-white rounded-md">
        {/* <p className="text-[50px] ">Liquidity Stellar</p> */}

        <div>
          <div className="flex gap-10 justify-between  items-center mb-2">
            <p className="text-[35px]">Click to generate a key pair</p>
            <Button
              variant="contained"
              onClick={generateKeypair}
              // fullWidth
              disabled={loading.generateKeypair}
            >
              {loading.generateKeypair ? (
                <CircularProgress size={24} />
              ) : (
                "Generate Keypair"
              )}
            </Button>
          </div>
          {keypair && (
            <p className="border bg-white shadow p-3">
              Generated new keypair @ Public key:{keypair?.publicKey()}
            </p>
          )}
        </div>

        {keypair && (
          <div className="flex justify-between mt-4 items-center">
            <p className="text-[35px]">Fund your newly generated keypair</p>
            <Button
              variant="contained"
              onClick={fundAccount}
              // fullWidth
              sx={{ mt: 2 }}
              disabled={loading.fundAccount}
            >
              {loading.fundAccount ? (
                <CircularProgress size={24} />
              ) : (
                "Fund Account"
              )}
            </Button>
          </div>
        )}

        {fundSuccess && (
          <div className="mt-5">
            <p className="text-[35px]">Create liquidity pool</p>
            <TextField
              label="Asset Name"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Token A Amount (XLM)"
              value={tokenAAmount}
              onChange={(e) => setTokenAAmount(e.target.value)}
              fullWidth
              margin="normal"
              type="number"
            />
            <TextField
              label="Token B Amount (Custom Asset)"
              value={tokenBAmount}
              onChange={(e) => setTokenBAmount(e.target.value)}
              fullWidth
              margin="normal"
              type="number"
            />
            <Button
              variant="contained"
              onClick={createLiquidityPool}
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading.createLiquidityPool}
            >
              {loading.createLiquidityPool ? (
                <CircularProgress size={24} />
              ) : (
                "Create Liquidity Pool"
              )}
            </Button>
            {createResult && (
              <p className="border bg-white shadow p-3 mt-3">
                Liquidity Pool created. Transaction URL:{" "}
                <Link
                  href={`https://stellar.expert/explorer/testnet/tx/${createResult.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Transaction
                </Link>
              </p>
            )}
          </div>
        )}

        {createSuccess && (
          <div className="mt-5">
            <p className="text-[35px]">Withhdraw liquidity pool</p>
            <TextField
              label="Liquidity Pool ID"
              value={liquidityPoolId}
              onChange={(e) => setLiquidityPoolId(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Withdraw Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              fullWidth
              margin="normal"
              type="number"
            />
            <Button
              variant="contained"
              onClick={withdrawFromPool}
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading.withdrawFromPool}
            >
              {loading.withdrawFromPool ? (
                <CircularProgress size={24} />
              ) : (
                "Withdraw from Pool"
              )}
            </Button>
            {withdrawResult && (
              <p className="border bg-white shadow p-3 mt-3">
                Withdrawal successful. Transaction URL:{" "}
                <Link
                  href={`https://stellar.expert/explorer/testnet/tx/${withdrawResult.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Transaction
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
