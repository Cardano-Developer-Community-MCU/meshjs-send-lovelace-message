import Image from "next/image";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { Transaction } from "@meshsdk/core";
import { useState, ChangeEvent } from "react";

export default function Home() {
  const { connected, wallet } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [txSuccess, setTxSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [txMessage, setTxMessage] = useState<string>("");

  function clearInput() {
    setRecipientAddress("");
    setSendAmount("");
  }

  function getRecipientAddress(event: ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value;
    setRecipientAddress(value);
  }

  function getAmount(event: ChangeEvent<HTMLInputElement>): void {
    const value = (parseInt(event.target.value) * 1000000).toString();
    setSendAmount(value);
  }

  function getTxMessage(event: ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value;
    setTxMessage(value);
  }

  async function txHandler() {
    setTxSuccess(false);
    setMessage("");
    try {
      const tx = new Transaction({ initiator: wallet }).sendLovelace(
        recipientAddress,
        sendAmount
      );

      tx.setMetadata(674, {
        msg: [txMessage],
      });

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      clearInput();
      setMessage(`Transaksi berhasil - ${txHash}`);
      setTxSuccess(true);
    } catch (error) {
      clearInput();
      setMessage(`Transaksi gagal - ${error}`);
      setTxSuccess(false);
    }
  }

  return (
    <div className="bg-slate-200 min-h-screen">
      <div className="bg-black p-6 text-white flex justify-between items-center">
        <div className="flex justify-center items-center">
          <Image
            src="/image1.png"
            alt="logo"
            width={100}
            height={100}
            className="rounded-full mr-6"
          />
          <h1 className="text-3xl font-bold">Cardano Developer Workshop MCU</h1>
        </div>
        <div>
          <CardanoWallet
            label="Hubungkan Wallet"
            isDark={false}
            metamask={{ network: "preprod" }}
          />
        </div>
      </div>
      {!connected && (
        <p className="text-red-500 text-center font-bold mt-20">
          Dompet tidak terhubung
        </p>
      )}
      {connected && (
        <>
          {!txSuccess && (
            <p className="mt-20 text-center font-bold text-red-500 mb-8">
              {message}
            </p>
          )}
          {txSuccess && (
            <p className="mt-20 text-center font-bold text-green-500 mb-8">
              {message}
            </p>
          )}
          <div className="flex justify-center items-center">
            <div className="border border-black rounded-xl p-8 flex-col justify-center items-center">
              <div>
                <input
                  type="text"
                  placeholder="Masukan Address Penerima"
                  className="px-3 py-2 w-72 border border-black rounded-xl mb-4"
                  onChange={getRecipientAddress}
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Masukan Jumlah ADA"
                  className="px-3 py-2 w-72 border border-black rounded-xl mb-4"
                  onChange={getAmount}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Masukan Memo"
                  className="px-3 py-2 w-72 border border-black rounded-xl mb-6"
                  onChange={getTxMessage}
                />
              </div>
              <button
                className="px-3 py-2 w-72 bg-blue-700 hover:bg-blue-500 rounded-xl text-white font-bold"
                onClick={txHandler}
              >
                Kirim
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
