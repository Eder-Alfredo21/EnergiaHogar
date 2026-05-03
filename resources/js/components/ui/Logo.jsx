const alturas = { sm: 'h-7', md: 'h-9', lg: 'h-12' };

export default function Logo({ variante = 'horizontal', tamano = 'md', className = '' }) {
    const h  = alturas[tamano] ?? alturas.md;
    const cl = `${h} w-auto ${className}`.trim();

    if (variante === 'mono') {
        return (
            <img src="/logos/logo-isotipo-mono.svg" alt="Energía Hogar" className={cl} />
        );
    }

    if (variante === 'isotipo') {
        return (
            <>
                <img src="/logos/logo-isotipo.svg"       alt="Energía Hogar" className={`${cl} block dark:hidden`} />
                <img src="/logos/logo-isotipo-light.svg" alt="Energía Hogar" className={`${cl} hidden dark:block`} />
            </>
        );
    }

    return (
        <>
            <img src="/logos/logo-horizontal.svg"      alt="Energía Hogar" className={`${cl} block dark:hidden`} />
            <img src="/logos/logo-horizontal-dark.svg" alt="Energía Hogar" className={`${cl} hidden dark:block`} />
        </>
    );
}
