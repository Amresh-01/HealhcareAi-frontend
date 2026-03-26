import { createContext, useContext, useState } from "react"
import { API_BASE_URL } from "../config"

const StateContext = createContext(null)

const StateContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token") || null)

  return (
    <StateContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => {
  const context = useContext(StateContext)
  if (!context) {
    throw new Error("useStateContext must be used within a StateContextProvider")
  }
  return context
}

export default StateContextProvider