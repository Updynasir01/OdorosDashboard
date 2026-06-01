import dns from 'dns'
import dotenv from 'dotenv'
import path from 'path'

/** Windows / some routers: Node SRV lookups fail unless IPv4 is preferred */
dns.setDefaultResultOrder('ipv4first')

/** Always load backend/.env when started via `npm run dev` from the backend folder. */
dotenv.config({ path: path.resolve(process.cwd(), '.env') })