import React, {useState, useContext, useEffect, useCallback} from 'react'
import { useHistory, useParams } from 'react-router-dom'
import DeviceContext from '../context/DeviceContext'
import Input from '../components/buttonsAndInputs/Input'
import SideBar from '../components/navbars/SideBar'
import Button3 from  '../components/buttonsAndInputs/Button3'
import Button4 from  '../components/buttonsAndInputs/Button4'
import AddBtn from '../components/buttonsAndInputs/AddBtn'
import LoadingSpinner1 from '../components/loadingAndErrors/LoadingSpinner1'
import '../css/edit-add-device.css'
import '../css/general.css'
import CustomFetch from '../utils/CustomFetch'
import { deviceUrls } from '../utils/ApiEndpoints'
import Error1 from '../components/loadingAndErrors/Error1'
import Success1 from '../components/loadingAndErrors/Success1'
import CodeItem from '../components/devices/CodeItem'
import AddCodePopup from '../components/devices/AddCodePopup'


const EditServer = () => {
    const history = useHistory()
    const {unit_id} = useParams()
    const {localServerDetail, removeServerFromState, addServerToState} = deviceUrls
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [name, setName] = useState(' ')


    const {allDevices} = useContext(DeviceContext)
    const [device, setDevice] = useState(null)

    const controller = new AbortController()
    const signal = controller.signal


    const handleSetName = (e) => {
        setName(e.target.value)
    } 


    const handleAbort = useCallback(() => {
        controller.abort()
        setLoading(false)
    }, [setDevice, controller])



    const handleEditDevice = async () => {
        setError(null)
    
        if(!name){
            setError('Please provide valid unit name')
            return
        } 
        const fetchConfig = {method:'PUT', body:JSON.stringify({
            name:name
        }), signal:signal}

        const {response, data} = await CustomFetch(`${localServerDetail.url}${device.id}/`, fetchConfig)
        if(response.status === 200){
            setLoading(false)
            setSuccess(true)
            addServerToState(data)
        }
        else{
            setError(data)
            setLoading(false)
        }
    }

    const handleDeleteDevice = async () => {
        setLoading(true)
        const fetchConfig = {method:'PUT', body:JSON.stringify({
            "household":null}), signal:signal}

        const {response, data} = await CustomFetch(`${localServerDetail.url}${device.id}/`, fetchConfig)

        if(response.status === 200){
            removeServerFromState(data.id)
            history.push("/home")
            return
        }
        setLoading(false)
        setError("could not delete device")
    }


    useEffect(() => {
        if(!allDevices) return

        let found = false

        for(let x = 0; x < allDevices.results.length; x++){
              if(allDevices.results[x].id === parseInt(unit_id)){
                setDevice(allDevices.results[x])
                setName(allDevices.results[x].name)
                setLoading(false)
                found = true
                break
            }
        }
        if(!found){
            setLoading(false)
            setError('device not found')
        } 
    }, [allDevices]) 


  return (
    <div className='w-100'>
        <SideBar/>
        <div className='container'>
            {success &&
                <Success1/>
            }
            {!success &&
            <div className='add-device-container'>
                <div className='w-100 justify-content-center'>
                    <h3 className='text-white'>Edit Server</h3>
                </div>
                {error &&
                    <Error1 message={error} wrapperClass={'w-75 justify-content-center'}/>
                }
                <div className='w-75'>
                    <Input
                    id='Name'
                    placeholder={name}
                    value={name}
                    onChange={handleSetName}
                    />
                </div>
                <div className='justify-content-between w-75 padding-10 margin-10'>
                    <Button3 text='Cancel' action={loading ? handleAbort : () => {history.goBack()}} />
                    <Button4 text={loading ? <LoadingSpinner1 size='lds-btn-size' /> : 'Save'}
                    action={handleEditDevice}
                     />
                </div>
            </div>
            }
        </div>
    </div>
  )
}

export default EditServer