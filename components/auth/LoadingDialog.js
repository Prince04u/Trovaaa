export default function LoadingDialog({ visible }) {
  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[200]" 
        style={{ backgroundColor: 'transparent', transition: '0.3s cubic-bezier(0.25, 0.8, 0.5, 1)' }}
      />
      
      {/* Dialog */}
      <div 
        className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
      >
        <div 
          className="w-full pointer-events-auto"
          style={{ 
            maxWidth: '300px',
            backgroundColor: '#009688',
            color: '#fff',
            borderRadius: '4px',
            boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)'
          }}
        >
          <div style={{ padding: '16px' }}>
            <span style={{ fontSize: '16px', lineHeight: '1', display: 'block', marginBottom: '16px', fontWeight: '400' }}>Loading</span>
            
            {/* Progress Bar Container */}
            <div 
              style={{
                height: '7px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '0'
              }}
            >
              {/* Progress Background */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  opacity: 0.3,
                  width: '100%'
                }}
              />
              
              {/* Progress Animated Bar */}
              <div 
                className="van-progress-indeterminate-long"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  backgroundColor: '#fff',
                  width: 'auto'
                }}
              />
              <div 
                className="van-progress-indeterminate-short"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  backgroundColor: '#fff',
                  width: 'auto'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
