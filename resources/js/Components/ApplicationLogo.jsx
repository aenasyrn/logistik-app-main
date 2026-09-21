export default function ApplicationLogo(props) {
    return (
        <div {...props} className={`flex items-center gap-2.5 ${props.className || ''}`}>
            <img src="/logo-smartlog.png" alt="SMARTLOG Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div className="flex items-center text-xl font-bold tracking-tight">
                <span className="text-[#0d5c3a]">SMART</span>
                <span className="text-[#4ade80]">LOG</span>
            </div>
        </div>
    );
}
