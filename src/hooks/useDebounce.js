import { useEffect, useState } from "react"

export const useDebounce = (inputText,delay = 500) => {
    const [search , setSearch] = useState(inputText)

    useEffect(() => {
      
       const timeout = setTimeout(() => {

        setSearch(inputText)

      }, delay);

      return () => clearTimeout(timeout)
    
    }, [inputText,delay])

    return {search}
    
}
