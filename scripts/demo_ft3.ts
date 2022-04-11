import { BlockchainClient } from 'simple-postchain'
import { Postchain, SingleSignatureAuthDescriptor, User, FlagsType, Blockchain } from 'ft3-lib'
import fetch from 'node-fetch'

let vaultUrl = "https://vault-testnet.chromia.com"
let blockchainUrl = "http://localhost:7740"
let chainId = 1
const client = BlockchainClient.initializeByChainId(blockchainUrl, chainId)

startup()

async function startup(){
  const blockchain = await get_blockchain_handle()
  get_blockchain_info(blockchain)
  register_ft3_user_tx()
  register_ft3_account_wrapper(blockchain)
}

async function get_blockchain_handle() {
  const bridText = await get_brid(blockchainUrl, chainId)
    .catch((reason => { throw new Error(reason) }))
  const bridHex = Buffer.from(bridText, 'hex')
  const blockchain = await new Postchain(blockchainUrl).blockchain(bridHex)
  
  return blockchain
}

async function get_blockchain_info(blockchain: Blockchain) {
    console.log("FT3 Demo")

    console.log("-------------- Blockchain Info --------------")
    console.log("name        : " + blockchain.info.name)
    console.log("website     : " + blockchain.info.website)
    console.log("description : " + blockchain.info.description)
}

async function register_ft3_user_tx() {
  const key_pair = client.createKeyPair();

  const authDescriptor = new SingleSignatureAuthDescriptor(
    key_pair.publicKey,
    [FlagsType.Account, FlagsType.Transfer]
  )

  await client
    .transaction()
    .addOperation('ft3.dev_register_account', authDescriptor.toGTV())
    .sign(key_pair)
    .send()
}

async function register_ft3_account_wrapper(blockchain: Blockchain) {
  const user = User.generateSingleSigUser([FlagsType.Account, FlagsType.Transfer])
  blockchain.registerAccount(user.authDescriptor, user)
}

async function get_brid(nodeApiUrl: string, chainId: number): Promise<string> {
    const url = `${nodeApiUrl}/brid/iid_${chainId}`

    const response = await fetch(url);
    return new Promise<string>((resolve, reject) => {
      if(!response.ok){
        reject(`Error resolving BRID for chainId ${chainId}, reason: ${response.statusText}`)
      }
      resolve(response.text())
    })
}


