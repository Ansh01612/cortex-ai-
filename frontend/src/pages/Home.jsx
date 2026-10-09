import { signInWithPopup } from 'firebase/auth'
import { useState } from 'react'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios'
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from 'react-redux';
import { setUserdata } from '../redux/userSlice';
import SideBar from '../components/SideBar';
import ChatArea from '../components/ChatArea';
import Artifact from '../components/Artifact';

function Home() {
    const {userData}=useSelector(state=>state.user)
    const dispatch=useDispatch()
    const [loginError, setLoginError] = useState("")
    const [loginLoading, setLoginLoading] = useState(false)

    const googleLogin = async () => {
        setLoginError("")
        setLoginLoading(true)
        try {
            const result = await signInWithPopup(auth, googleProvider)
            const token = await result.user.getIdToken()
            const { data } = await api.post("/api/auth/login", { token })
            dispatch(setUserdata(data))
        } catch (error) {
            setLoginError(getLoginErrorMessage(error))
        } finally {
            setLoginLoading(false)
        }
    }
    return (
        <div className='h-screen  flex bg-[#0d0f14] text-white overflow-hidden'>

<SideBar/>
<ChatArea/>
<Artifact/>




{!userData &&   <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur'>
                <div className='w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5'>
                    <div className='flex flex-col gap-1'>
                        <h2 className='text-[17px] font-semibold text-slate-100 tracking-tight'>Welcome to CortexAI</h2>
                        <p className='text-[13px] text-slate-500'>Please login to continue using the app.</p>
                    </div>

                    {loginError && (
                        <p role="alert" className="text-sm text-red-400">{loginError}</p>
                    )}
                    <button disabled={loginLoading} className='w-full flex items-center justify-center gap-3 py-[11px] rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-200 disabled:opacity-60 transition-all duration-150 cursor-pointer' onClick={googleLogin}>
                        <FcGoogle size={15} />
                        {loginLoading ? "Connecting..." : "Continue With Google"}
                    </button>
                </div>
            </div>}
          
        </div>
    )
}

function getLoginErrorMessage(error) {
    switch (error?.code) {
        case "auth/unauthorized-domain":
            return "This domain is not authorized for Firebase sign-in. Add localhost in Firebase Authentication settings."
        case "auth/operation-not-allowed":
            return "Google sign-in is disabled. Enable Google in Firebase Authentication sign-in providers."
        case "auth/network-request-failed":
            return "Could not reach Google sign-in. Check your network connection and try again."
        default:
            return error?.response?.data?.message || error?.message || "Google sign-in failed. Please try again."
    }
}

export default Home
