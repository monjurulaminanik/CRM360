const Card = ({ children, className = '', hover = false, ...props }) => (
  <div
    className={`bg-white rounded-xl border border-gray-100 shadow-card transition-all duration-200 ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

const Header = ({ children, className = '', border = true }) => (
  <div className={`px-5 py-4 ${border ? 'border-b border-gray-100' : ''} ${className}`}>
    {children}
  </div>
);

const Body = ({ children, className = '' }) => (
  <div className={`px-5 py-4 ${className}`}>{children}</div>
);

const Footer = ({ children, className = '', border = true }) => (
  <div className={`px-5 py-4 ${border ? 'border-t border-gray-100' : ''} ${className}`}>
    {children}
  </div>
);

Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

export default Card;
