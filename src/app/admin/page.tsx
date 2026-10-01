import Admin from './admin';
import DemoAdmin from './demo-admin';
import { isDemo } from '@/lib/demo';
export const dynamic='force-dynamic';
export default function Page(){return <main id="main" className="shell">{isDemo()?<DemoAdmin/>:<Admin/>}</main>}
