function QRCode() {
    return (
        <>
            <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
                <rect x="6" y="6" width="12" height="12" rx="2.5" stroke="currentColor"
                      strokeWidth="1.5"></rect>
                <rect x="22" y="6" width="12" height="12" rx="2.5" stroke="currentColor"
                      strokeWidth="1.5"></rect>
                <rect x="6" y="22" width="12" height="12" rx="2.5" stroke="currentColor"
                      strokeWidth="1.5"></rect>
                <rect x="22" y="22" width="5" height="5" rx="1" fill="currentColor"></rect>
                <rect x="29" y="22" width="5" height="5" rx="1" fill="currentColor"></rect>
                <rect x="22" y="29" width="5" height="5" rx="1" fill="currentColor"></rect>
            </svg>
        </>
    )
}

export default QRCode