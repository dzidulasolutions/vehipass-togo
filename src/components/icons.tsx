type IconProps = {
  size?: number
  /** Par défaut « currentColor » : l'icône prend la couleur du texte (text-muted, text-primary...). */
  color?: string
  className?: string
}

const svgProps = (size: number, className?: string) => ({
  width: size,
  height: size,
  className,
  'aria-hidden': true as const,
  focusable: 'false' as const,
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
})

export const IconlyArrowRight = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 24">
    <path d="M19.1501 12L4.74988 12" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    <path d="M13.7001 5.97541L19.7501 11.9994L13.7001 18.0244" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
  </svg>
)

export const IconlyDocument = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 24">
    <path d="M15.0416 9.229H8.97162" stroke={color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
    <path d="M11.2876 13.3931H8.97162" stroke={color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
    <path d="M4.22699 2.75V21.25H20.973V2.75H4.22699Z" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
  </svg>
)

export const IconlyWallet = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 24">
    <path d="M21.8806 16.7095H17.8064C16.3104 16.7087 15.0978 15.6057 15.0969 14.2438C15.0969 12.8819 16.3104 11.7789 17.8064 11.7781H21.8806" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    <path fillRule="evenodd" clipRule="evenodd" d="M2.61938 5.72595H21.8807V21.25H2.61938V5.72595Z" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    <path d="M19.2486 5.628V2.75074L2.61938 2.75V21.2495" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    <path d="M7.18384 10.2938H12.6174" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
  </svg>
)

export const IconlyActivity = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 26">
    <path fillRule="evenodd" clipRule="evenodd" d="M3.26074 9.88364H21.248V11.3836H3.26074V9.88364Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M15.6088 13.4962H17.1173V14.9962H15.6088V13.4962Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M11.5045 13.4962H13.013V14.9962H11.5045V13.4962Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.39117 13.4962H8.89974V14.9962H7.39117V13.4962Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M15.6088 17.0912H17.1173V18.5912H15.6088V17.0912Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M11.5045 17.0912H13.013V18.5912H11.5045V17.0912Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.39117 17.0912H8.89974V18.5912H7.39117V17.0912Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M16.7408 3.03467V7.57865H15.2408V3.03467H16.7408Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M9.26855 3.03467V7.57865H7.76855V3.03467H9.26855Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M3.17578 4.49536H21.3258V23.0347H3.17578V4.49536ZM4.67578 5.99536V21.5347H19.8258V5.99536H4.67578Z" fill={color} />
  </svg>
)

export const IconlyAddUser = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 25">
    <path fillRule="evenodd" clipRule="evenodd" d="M20.043 8.41895V13.9289H18.543V8.41895H20.043Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M16.498 10.4238H22.088V11.9238H16.498V10.4238Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M10.171 4C8.14347 4 6.5 5.64275 6.5 7.66973C6.5 9.69672 8.14347 11.3395 10.171 11.3395C12.1971 11.3395 13.8408 9.69686 13.8408 7.66973C13.8408 5.6426 12.1971 4 10.171 4ZM5 7.66973C5 4.81374 7.31562 2.5 10.171 2.5C13.0253 2.5 15.3408 4.81389 15.3408 7.66973C15.3408 10.5256 13.0253 12.8395 10.171 12.8395C7.31562 12.8395 5 10.5257 5 7.66973Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M4.08399 19.685C5.86797 20.6222 7.94447 21.0057 10.2032 21.0001H10.2068C12.4655 21.0057 14.542 20.6222 16.3259 19.685C15.3015 17.2392 13.0146 16.0617 10.2069 16.0689H10.2031C7.39191 16.0617 5.10872 17.2364 4.08399 19.685ZM10.205 14.5689C6.70556 14.5605 3.5886 16.1881 2.44701 19.7981L2.26976 20.3586L2.77172 20.6646C4.97609 22.0084 7.53873 22.5064 10.205 22.5001C12.8713 22.5064 15.4339 22.0084 17.6383 20.6646L18.1402 20.3586L17.963 19.7981C16.8226 16.1917 13.701 14.5605 10.205 14.5689Z" fill={color} />
  </svg>
)

export const IconlyPlus = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 26">
    <path fillRule="evenodd" clipRule="evenodd" d="M12.9996 8.6123V17.4387H11.4996V8.6123H12.9996Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M7.83398 12.2751H16.6673V13.7751H7.83398V12.2751Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M2.25 23.0347L2.25 3.03467L22.25 3.03467L22.25 23.0347L2.25 23.0347ZM3.75 21.5347L20.75 21.5347L20.75 4.53467L3.75 4.53467L3.75 21.5347Z" fill={color} />
  </svg>
)

export const IconlyChart = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 25">
    <path d="M7.41367 10.9624V16.9922" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    <path d="M12.2506 8.07715V16.9923" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    <path d="M17.0865 14.1489V16.9924" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    <path opacity="0.4" fillRule="evenodd" clipRule="evenodd" d="M21.5 21.7847L21.5 3.28467L3 3.28467L3 21.7847L21.5 21.7847Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconlyHome = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 24 24">
    <path
      transform="translate(2.5 2)"
      d="M6.65721519,18.7714023 L6.65721519,15.70467 C6.65719744,14.9246392 7.29311743,14.2908272 8.08101266,14.2855921 L10.9670886,14.2855921 C11.7587434,14.2855921 12.4005063,14.9209349 12.4005063,15.70467 L12.4005063,15.70467 L12.4005063,18.7809263 C12.4003226,19.4432001 12.9342557,19.984478 13.603038,20 L15.5270886,20 C17.4451246,20 19,18.4606794 19,16.5618312 L19,16.5618312 L19,7.8378351 C18.9897577,7.09082692 18.6354747,6.38934919 18.0379747,5.93303245 L11.4577215,0.685301154 C10.3049347,-0.228433718 8.66620456,-0.228433718 7.51341772,0.685301154 L0.962025316,5.94255646 C0.362258604,6.39702249 0.00738668938,7.09966612 0,7.84735911 L0,16.5618312 C0,18.4606794 1.55487539,20 3.47291139,20 L5.39696203,20 C6.08235439,20 6.63797468,19.4499381 6.63797468,18.7714023 L6.63797468,18.7714023"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const IconlySearch = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M11.2485 3.50024C7.22315 3.50024 3.95996 6.76343 3.95996 10.7888C3.95996 14.8141 7.22315 18.0773 11.2485 18.0773C15.2738 18.0773 18.537 14.8141 18.537 10.7888C18.537 6.76343 15.2738 3.50024 11.2485 3.50024ZM2.45996 10.7888C2.45996 5.93501 6.39472 2.00024 11.2485 2.00024C16.1023 2.00024 20.037 5.93501 20.037 10.7888C20.037 15.6426 16.1023 19.5773 11.2485 19.5773C6.39472 19.5773 2.45996 15.6426 2.45996 10.7888Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M16.7359 15.6477L22.3514 21.2486L21.2921 22.3106L15.6766 16.7097L16.7359 15.6477Z" fill={color} />
  </svg>
)

export const IconlyUser = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 24 24">
    <path fill={color} fillRule="evenodd" clipRule="evenodd" d="M7.75 7.5a4.25 4.25 0 1 1 8.5 0a4.25 4.25 0 0 1-8.5 0M12 4.75a2.75 2.75 0 1 0 0 5.5a2.75 2.75 0 0 0 0-5.5m-4 10A2.25 2.25 0 0 0 5.75 17v1.188c0 .018.013.034.031.037c4.119.672 8.32.672 12.438 0a.04.04 0 0 0 .031-.037V17A2.25 2.25 0 0 0 16 14.75h-.34a.3.3 0 0 0-.079.012l-.865.283a8.75 8.75 0 0 1-5.432 0l-.866-.283a.3.3 0 0 0-.077-.012zM4.25 17A3.75 3.75 0 0 1 8 13.25h.34q.28.001.544.086l.866.283a7.25 7.25 0 0 0 4.5 0l.866-.283c.175-.057.359-.086.543-.086H16A3.75 3.75 0 0 1 19.75 17v1.188c0 .754-.546 1.396-1.29 1.517a40.1 40.1 0 0 1-12.92 0a1.54 1.54 0 0 1-1.29-1.517z" />
  </svg>
)

/** Coche (trait Feather, sans cercle) : statut « ok ». */
export const FiCheckCircle = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 24 24">
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m4 12l6 6L20 6" />
  </svg>
)

/** Croix (trait Feather, sans cercle) : statut « refusé / erreur ». */
export const FiXCircle = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 24 24">
    <path stroke={color} strokeLinecap="round" strokeWidth="2" d="M20 20L4 4m16 0L4 20" />
  </svg>
)

export const IconlyShow = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 25">
    <path fillRule="evenodd" clipRule="evenodd" d="M12.0022 10.0361C10.6703 10.0361 9.59021 11.1155 9.59021 12.4481C9.59021 13.7799 10.6704 14.8601 12.0022 14.8601C13.334 14.8601 14.4142 13.7799 14.4142 12.4481C14.4142 11.1155 13.3342 10.0361 12.0022 10.0361ZM8.09021 12.4481C8.09021 10.2867 9.84215 8.5361 12.0022 8.5361C14.1623 8.5361 15.9142 10.2867 15.9142 12.4481C15.9142 14.6083 14.1624 16.3601 12.0022 16.3601C9.842 16.3601 8.09021 14.6083 8.09021 12.4481Z" fill={color} />
    <path fillRule="evenodd" clipRule="evenodd" d="M4.97577 6.99435C6.77017 5.47727 9.25098 4.39609 12.0022 4.39609C14.7529 4.39609 17.2337 5.47642 19.0282 6.99314C20.8033 8.49335 22.0042 10.5101 22.0042 12.4481C22.0042 14.3861 20.8033 16.4028 19.0282 17.903C17.2337 19.4198 14.7529 20.5001 12.0022 20.5001C9.25098 20.5001 6.77017 19.4189 4.97577 17.9018C3.20099 16.4013 2.00024 14.3846 2.00024 12.4481C2.00024 10.5116 3.20099 8.49485 4.97577 6.99435ZM5.94422 8.13983C4.3705 9.47033 3.50024 11.1046 3.50024 12.4481C3.50024 13.7916 4.3705 15.4258 5.94422 16.7564C7.49832 18.0703 9.64351 19.0001 12.0022 19.0001C14.3606 19.0001 16.5058 18.0709 18.06 16.7574C19.6337 15.4273 20.5042 13.7931 20.5042 12.4481C20.5042 11.1031 19.6337 9.46883 18.06 8.13878C16.5058 6.82525 14.3606 5.89609 12.0022 5.89609C9.64351 5.89609 7.49832 6.82591 5.94422 8.13983Z" fill={color} />
  </svg>
)

export const IconlyHide = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 25">
    <path fillRule="evenodd" clipRule="evenodd" d="M3.58279 20.8134C3.72879 20.9604 3.92079 21.0334 4.11279 21.0334C4.30479 21.0334 4.49679 20.9604 4.64279 20.8134L6.8693 18.5868C6.92208 18.5468 6.97024 18.4991 7.01201 18.4441L20.4168 5.03936C20.7098 4.74636 20.7098 4.27136 20.4168 3.97836C20.1238 3.68536 19.6498 3.68536 19.3568 3.97836L17.4787 5.85659C15.8036 4.8682 13.9202 4.34845 11.9958 4.34845C6.45585 4.34845 1.99585 8.75245 1.99585 12.3984C1.99585 14.3482 3.25178 16.5047 5.25638 18.0797L3.58279 19.7534C3.28979 20.0464 3.28979 20.5204 3.58279 20.8134ZM6.32619 17.0098C4.61299 15.7148 3.49585 13.918 3.49585 12.3984C3.49585 9.45045 7.41785 5.84845 11.9958 5.84845C13.5225 5.84845 15.0206 6.22983 16.3776 6.95776L14.1842 9.15125C13.5423 8.71895 12.7766 8.48004 11.9977 8.48004H11.9887C10.9437 8.48204 9.96272 8.89104 9.22472 9.63104C8.48772 10.371 8.08272 11.354 8.08572 12.394C8.0827 13.1742 8.32084 13.9406 8.75435 14.5815L6.32619 17.0098ZM9.84732 13.4884L13.0907 10.2448C12.754 10.0729 12.3779 9.98004 11.9967 9.98004H11.9917C11.3467 9.98104 10.7417 10.233 10.2877 10.689C9.83372 11.146 9.58372 11.751 9.58572 12.395C9.58392 12.7775 9.67612 13.153 9.84732 13.4884Z" fill={color} />
    <path d="M11.9942 20.4492C11.0472 20.4492 10.0962 20.3192 9.16418 20.0612C8.76518 19.9512 8.53118 19.5382 8.64118 19.1392C8.75118 18.7392 9.16718 18.5062 9.56418 18.6162C10.3652 18.8372 11.1822 18.9492 11.9942 18.9492C16.5772 18.9492 20.5042 15.3472 20.5042 12.3982C20.5042 11.4432 20.0602 10.3542 19.2552 9.33423C18.9992 9.00923 19.0552 8.53723 19.3802 8.28023C19.7052 8.02423 20.1772 8.07923 20.4332 8.40423C21.4462 9.68923 22.0042 11.1072 22.0042 12.3982C22.0042 16.0452 17.5392 20.4492 11.9942 20.4492Z" fill={color} />
    <path d="M12.5662 16.25C12.2112 16.25 11.8962 15.997 11.8292 15.636C11.7542 15.229 12.0242 14.837 12.4322 14.763C13.4112 14.582 14.1892 13.804 14.3662 12.824C14.4402 12.416 14.8292 12.148 15.2382 12.22C15.6452 12.294 15.9162 12.684 15.8422 13.092C15.5542 14.682 14.2932 15.945 12.7022 16.237C12.6572 16.246 12.6112 16.25 12.5662 16.25Z" fill={color} />
  </svg>
)

export const IconlyLoader = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 24 24">
    <path fill={color} d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z">
      <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" />
    </path>
  </svg>
)

export const IconlyLogout = ({ size = 24, color = 'currentColor', className }: IconProps) => (
  <svg {...svgProps(size, className)} viewBox="0 0 25 24">
    <path d="M21.019 11.9997L8.24121 11.9997" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    <path d="M18.479 8.7251L21.7686 12.0001L18.479 15.2761" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    <path d="M13.2554 16.625L13.2554 21.25L2.73144 21.25L2.73144 2.75L13.2554 2.75L13.2554 7.375" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
  </svg>
)