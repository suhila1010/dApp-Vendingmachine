import Head from 'next/head'
import {useState, useEffect} from 'react'
import Web3 from 'web3'
import 'bulma/css/bulma.css'
import styles from '../styles/vendingMachine.module.css'
import vendingMachineContract from '../blockchain/vending'

const VendingMachine = () => {
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [inventory, setInventory] = useState('')
    const [MyDountCount, setMyDountCount] = useState('')
    const [buyCount, setBuyCount] = useState('')
    const [web3, setWeb3] = useState(null);
    const [address, setAddress] = useState(null);
    const [vmcontract, setVmContarct] = useState(null);
    //const [purchases, setPurchases] = useState(0);
    
    useEffect(() => {
        if(vmcontract) getInventoryHandler()
        if(vmcontract && address) getMyDountCountHandler()
        
    }, [vmcontract, address ])
    
    const getInventoryHandler = async() => {
        const inventory = await vmcontract.methods.getVendingMachineBalance().call()
        //console.log(inventory)
        setInventory(inventory)
    }
    const getMyDountCountHandler = async () => {
        const count = await vmcontract.methods.donutBalances(address).call()
        setMyDountCount(count)
    }
    const updateDountQty  = event => {
        setBuyCount(event.target.value);
    }
    const buyDountsHandler = async () => {
        try{
            await vmcontract.methods.purchase(buyCount).send({
                from: address,
                value: web3.utils.toWei('2', 'ether') * buyCount
            })
            //setPurchases(purchases++)
            setSuccessMsg(`${buyCount} dount purchased!`)
            
            if(vmcontract) getInventoryHandler()
            if(vmcontract && address) getMyDountCountHandler()
        }catch(err){
            setError(err.message)
        }
        
    }
    const connectWalletHandler = async () => {
        /*check if metamask is available*/
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined"){
            try{
                /* request wallet connect*/ 
                await window.ethereum.request({ method: "eth_requestAccounts"})
                /*set web3 instance*/
                const web3 = new Web3(window.ethereum)
                setWeb3(web3)
                /** get list of accounts */
                const accounts = await web3.eth.getAccounts()
                setAddress(accounts[0])
                /** creat local contract copy  */
                const vm = vendingMachineContract(web3)
                setVmContarct(vm);
            } catch(err){
                setError(err.message)
            }
        }else{
            //meta mask not installed
            console.log("please install MwtaMask.")
        }
    }
    return(
        <div className={styles.main}>
            <Head>
                <title>Vending Machine App</title>
                <meta name="description" content="A blockchain vending app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <nav className="navbar mt-4 mb-5">
                <div className='container'>
                    <div className='navbar-brand'>
                        <h1>Vending Machine</h1>
                    </div>
                    <div className='navbar-end'>
                        <button onClick={connectWalletHandler} className='button is-primary'>Connect Wallet</button>
                    </div>
                </div>
            </nav>
            <section>
                <div className='container'>
                    <h2>Vending machine inventory: {inventory}</h2>
                </div>
            </section>
            <section>
                <div className='container'>
                    <h2>My Dounts: {MyDountCount}</h2>
                </div>
            </section>
            <section className='mt-5'>
                <div className='container'>
                    <div className='field'>
                        <label className='label'>
                            Buy Dounts
                        </label>
                        <div className='control'>
                            <input onChange={updateDountQty} className='input' type="type" placeholder='Enter amount...'></input>
                        </div>
                        <button onClick={buyDountsHandler}
                            className='button is-primary mt-2'>
                            Buy</button>
                    </div>
                </div>
            </section>
            <section>
                <div className='container has-text-danger'>
                    <p>{error}</p>
                </div>
            </section>
            <section>
                <div className='container has-text-success'>
                    <p>{successMsg}</p>
                </div>
            </section>
        </div>
    )
}

export default VendingMachine 