import React from "react";

/**
 * BASE DESIGN TOKENS
 */
const BR = {
  low: 'rounded-md',      
  md: 'rounded-lg',      
  lg: 'rounded-2xl', 
  full: 'rounded-full'    
};

const FS = {
  xs: 'text-[9px] leading-tight font-medium uppercase tracking-wider',
  sm: 'text-[10px] leading-snug font-semibold',
  base: 'text-xs sm:text-sm leading-normal font-bold',
  lg: 'text-base sm:text-xl leading-tight font-black tracking-tight',
  xl: 'text-xl sm:text-3xl leading-none font-black tracking-tighter',
};

export const THEME = {
  radius: {
    card: BR.md,
    button: BR.low,
    image: `rounded-t-lg`, 
    modal: BR.lg,
    badge: BR.full,
    input: BR.low,
    logo: BR.low,
    reference: BR.low,
    chip: BR.full,
    carousel: BR.md,
    checkbox: 'rounded-[0.2rem]', 
  },

  font: FS,

  colors: {
    danger: 'text-red-600 bg-red-50 border-red-100 hover:bg-red-600 hover:text-white',
    success: 'text-green-700 bg-green-50 border-green-100 hover:bg-green-600 hover:text-white',
    adminEdit: 'bg-amber-50/50 border-amber-200',
    adminHighlight: 'focus:bg-white/20 focus:outline-none',
    visualFallback: '#FFFFFF',
  },

  typography: {
    marquee: {
      container: 'overflow-hidden whitespace-nowrap',
      adminMode: 'whitespace-normal',
      track: 'marquee-track inline-block',
    }
  },

  icons: {
    dots: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>,
    back: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>,
    close: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    whatsapp: <svg className="w-full h-full fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.506-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.13.57-.074 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.648h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
    search: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
    lock: <svg viewBox="0 0 24 24" className="w-full h-full fill-current"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" /></svg>,
    backspace: <svg viewBox="0 0 24 24" className="w-full h-full fill-current"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z" /></svg>,
    chevronLeft: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>,
    chevronRight: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
    power: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-full h-full p-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" /></svg>,
    plus: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-full h-full p-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
    check: <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    adminLayout: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-0.5"><path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" /></svg>,
  },

  button: {
    base: 'flex items-center justify-center border transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none font-black uppercase tracking-widest',
    variants: {
      primary: 'bg-stone-900 text-white border-stone-800 shadow-xl hover:bg-stone-800',
      secondary: 'bg-white text-stone-900 border-stone-200 shadow-lg hover:bg-stone-50',
      danger: 'bg-red-50 text-red-600 border-red-100 shadow-md hover:bg-red-600 hover:text-white',
      success: 'bg-green-50 text-green-700 border-green-100 shadow-md hover:bg-green-600 hover:text-white',
      kraft: 'bg-kraft-600 text-white border-kraft-700 shadow-xl hover:bg-kraft-700',
      glass: 'bg-stone-200/40 backdrop-blur-xl text-stone-900 border-white/20 hover:bg-stone-200/60 shadow-none',
      ghost: 'bg-transparent text-stone-500 border-transparent hover:bg-stone-100 shadow-none',
      whatsapp: `bg-stone-900 text-white ${BR.low} transition-all active:scale-95 shadow-sm hover:bg-black`,
    },
    sizes: {
      circle: { xs: 'w-6 h-6', sm: 'w-9 h-9', md: 'w-11 h-11', lg: 'w-14 h-14' },
      rectangle: { xs: 'px-2 py-1 text-[9px]', sm: 'px-4 py-2 text-[11px]', md: 'px-6 py-3 text-xs', lg: 'px-8 py-4 text-sm' }
    }
  },
  
  navbar: {
    layout: 'bg-white/80 backdrop-blur-xl border-b border-stone-100 sticky top-0 z-[100] h-14 sm:h-16',
    container: 'max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-full flex items-center',
    innerWrapper: 'flex justify-between items-center gap-2 w-full',
    brand: {
      wrapper: 'flex items-center gap-1.5 shrink-0',
      logoWrapper: 'flex items-center justify-center transition-all active:scale-90',
      logoImg: 'w-9 h-9 sm:w-10 sm:h-10 object-contain',
      logoEmoji: FS.xl.replace('font-black', 'font-normal'),
      textWrapper: 'flex flex-col leading-tight',
      name: `${FS.base} tracking-tight`,
      tagline: `${FS.xs} text-stone-400 font-semibold`,
      adminBadge: `ml-1 ${FS.xs} bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 ${BR.low}`,
      editHighlight: `cursor-pointer hover:bg-stone-100 ${BR.low} px-1 transition-colors`,
    },
    contact: {
      wrapper: 'flex items-center shrink-0 min-w-0',
      address: 'hidden md:block text-xs text-stone-500 hover:text-stone-900 transition-colors whitespace-nowrap truncate max-w-[200px] px-1',
      mapUrlBase: 'https://www.google.com/maps/search/?api=1&query=',
      separator: 'hidden lg:block w-px h-4 bg-stone-200 mx-3',
      actions: 'flex items-center gap-2',
      instagram: 'text-stone-400 hover:text-pink-600 transition-all active:scale-75 cursor-pointer',
      instagramIconSize: 'w-5 h-5 sm:w-6 sm:h-6',
      whatsapp: `flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 bg-stone-900 text-white ${BR.low} transition-all active:scale-95 shadow-sm hover:bg-black`,
      whatsappIconSize: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
      phoneText: `${FS.xs} font-black tracking-tight`,
    }
  },

  floatingAdminMenu: {
    wrapper: 'fixed bottom-5 right-4 z-[150]',
    container: `flex flex-col items-center p-1 bg-stone-200/50 backdrop-blur-xl border border-white/20 shadow-2xl ${BR.full} transition-all duration-200`,
    innerActions: 'flex flex-col gap-1.5 overflow-hidden transition-all duration-200',
    actionsActive: 'max-h-32 opacity-100 mt-0.5 mb-1.5',
    actionsInactive: 'max-h-0 opacity-0',
    toggleActive: '!bg-stone-900/10 !text-stone-900 shadow-none border-transparent',
    toggleInactive: 'shadow-sm',
  },

  heroCarousel: {
    layout: `relative w-full group/carousel overflow-hidden ${BR.md}`,
    heights: 'h-[240px] sm:h-[320px] md:h-[400px]',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6',
    slide: {
      base: 'absolute inset-0 transition-opacity duration-700 ease-in-out',
      image: 'absolute inset-0 w-full h-full object-cover',
      placeholderBg: 'bg-stone-200',
      overlay: 'absolute inset-0 z-30 flex items-center justify-center bg-black/10',
      loadingSpinner: 'w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin',
      loadingBlur: 'opacity-50 blur-sm',
      changeBadge: `absolute top-4 right-4 z-30 pointer-events-none bg-white/90 backdrop-blur px-3 py-1.5 ${BR.full} ${FS.xs} font-black shadow-xl`,
    },
    navigation: {
      navBtnStyle: 'opacity-0 group-hover/carousel:opacity-100 hidden sm:flex',
      prevPos: 'left-4',
      nextPos: 'right-4',
      dotsWrapper: 'absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10',
      dotBase: `w-1.5 h-1.5 ${BR.full} transition-all duration-300`,
      dotActive: 'bg-white w-4',
      dotInactive: 'bg-white/30',
    }
  },

  searchFilter: {
    layout: 'bg-white border-b border-stone-200 py-3 relative sticky top-[56px] sm:top-[64px] z-40',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-3',
    searchArea: {
      wrapper: 'flex w-full sm:w-auto items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap',
      inputWrapper: `relative flex-1 sm:w-48 min-w-[140px] ${BR.low}`,
      iconSize: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400',
      input: `w-full pl-9 pr-8 py-2 border border-stone-200 ${FS.sm} text-stone-900 focus:ring-2 focus:ring-stone-900 outline-none transition bg-stone-50/50 ${BR.low}`,
      clearButton: 'absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 p-1 transition-colors',
      mobileToggle: `sm:hidden flex items-center gap-1.5 px-4 py-2 bg-stone-100 border border-stone-200 ${FS.xs} font-black text-stone-700 ${BR.low}`,
    },
    categoryList: {
      wrapper: 'flex flex-wrap gap-2 items-center flex-1 transition-all w-full',
      chip: {
        container: `flex items-stretch overflow-hidden border transition-all duration-300 ${BR.full}`,
        active: 'bg-stone-900 text-white border-stone-900 shadow-lg scale-105',
        activeText: 'text-white',
        inactive: 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 active:scale-95',
        inactiveText: 'text-stone-600',
        counter: {
          base: `${FS.xs} font-black w-7 h-7 flex items-center justify-center shrink-0 transition-colors`,
          active: 'bg-white/20 text-white',
          inactive: 'bg-stone-50 text-stone-400 border-r border-stone-100',
        },
        adminSelectWrapper: 'relative w-10 h-full bg-white border-r border-stone-200 flex items-center justify-center overflow-hidden',
        adminSelect: `absolute inset-0 w-full h-full bg-transparent text-stone-900 ${FS.xs} font-black appearance-none text-center m-0 p-0 border-none outline-none cursor-pointer z-10`,
        textButton: `py-2 ${FS.xs} font-black whitespace-nowrap flex items-center gap-1.5`,
        deleteIcon: 'ml-1 text-red-400 hover:text-red-600 font-black text-xs transition-colors',
      },
      showMoreButton: `${BR.full} hidden sm:flex items-center gap-1.5 px-4 py-2 ${FS.xs} font-black bg-stone-50 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-all`,
      addCategoryButton: `flex items-center justify-center w-9 h-9 border-2 border-dashed border-stone-200 text-stone-300 hover:border-stone-900 hover:text-stone-900 transition-all active:scale-90 group bg-stone-50/30 ${BR.low}`,
    }
  },

  productGrid: {
    layout: 'w-full flex flex-col min-h-[400px]',
    sectionSpacing: 'mt-12 first:mt-4',
    header: {
      wrapper: 'flex items-center gap-3 mb-6 px-1',
      title: `${FS.base} font-black text-stone-900 tracking-tighter`,
      line: 'flex-1 h-px bg-stone-200',
      count: `${FS.xs} font-bold text-stone-400`,
    },
    cols: 'grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4',
    gap: 'gap-x-2 gap-y-2 sm:gap-x-6 sm:gap-y-10',
    emptyState: {
      wrapper: 'flex flex-col items-center justify-center py-20 text-stone-400 animate-in fade-in duration-700',
      iconSize: 'w-16 h-16 mb-4 opacity-20',
      text: `${FS.sm} font-medium italic tracking-wide`,
      adminWrapper: `text-center py-16 border-2 border-dashed border-stone-100 ${BR.lg} mb-12 bg-stone-50/30`,
    }
  },

  footer: {
    layout: 'bg-white border-t border-stone-200 mt-16 relative',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10',
    grid: 'grid grid-cols-1 md:grid-cols-3 items-start gap-12 md:gap-8',
    brand: {
      wrapper: 'flex flex-col items-center md:items-start gap-3',
      logoImg: 'w-10 h-10 object-contain group-active:scale-90 transition-transform',
      logoEmoji: 'text-3xl group-active:scale-90 transition-transform',
      name: `${FS.lg} text-stone-900`,
      tagline: `${FS.sm} text-kraft-600 mt-0.5`,
      socialLinks: 'flex items-center gap-3 mt-1',
      copyright: `${FS.xs} text-stone-400 text-center md:text-left leading-relaxed`,
    },
    location: {
      wrapper: 'flex flex-col items-center gap-4 text-center',
      label: `${FS.xs} font-black text-stone-300 mb-1`,
      addressLink: `${FS.sm} text-stone-500 hover:text-stone-900 transition-colors max-w-[200px] leading-relaxed`,
      qrFrame: `bg-stone-50 p-2 ${BR.low} border border-stone-100 shadow-sm cursor-pointer hover:scale-105 transition-transform group`,
      qrIcon: 'w-10 h-10 grayscale group-hover:grayscale-0 transition-all',
      qrLabel: `${FS.xs} font-bold text-stone-300`,
    },
    coupons: {
      wrapper: 'flex flex-col items-center md:items-end gap-2.5',
      label: `${FS.xs} font-black text-stone-300`,
      inputWrapper: 'flex gap-1 w-full max-w-[240px]',
      input: `flex-1 px-3 py-2 border ${BR.low} ${FS.xs} font-bold transition-all outline-none`,
      inputActive: 'border-green-500 bg-green-50 text-green-700',
      inputError: 'border-red-400 bg-red-50 text-red-700',
      inputDefault: 'border-stone-200 text-stone-600 bg-white',
      button: `text-white px-3 py-2 ${BR.low} hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0`,
      activeStatus: 'flex flex-col items-center md:items-end animate-in fade-in slide-in-from-top-1',
      errorStatus: `${FS.xs} font-bold text-red-500`,
    },
    qrModal: {
      overlay: 'fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center cursor-pointer animate-in fade-in duration-300',
      content: `bg-white p-8 ${BR.lg} shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300`,
      qrImg: 'w-64 h-64',
      title: `${FS.sm} font-black text-stone-900`,
      closeHint: `${FS.xs} text-stone-400`,
    }
  },

  productCard: {
    container: `bg-white border-2 transition-all duration-300 relative flex flex-col group ${BR.md}`,
    activeBorder: 'border-stone-200',
    outOfStockBorder: 'border-transparent bg-stone-50',
    shadow: 'hover:shadow-xl',
    padding: 'p-3',
    gap: 'gap-1',
    innerLayout: {
      contentWrapper: 'flex flex-col gap-1 flex-grow',
      descriptionWrapper: 'relative min-h-[24px]',
      footerWrapper: 'mt-auto pt-1',
      adminActionsWrapper: 'transition-all duration-300',
      adminActionsActive: 'opacity-100 scale-100',
      adminActionsInactive: 'opacity-0 scale-90 pointer-events-none',
    },
    image: {
      wrapper: `relative w-full transition-all duration-500 overflow-hidden group/img ${BR.md}`,
      aspect: 'aspect-square',
      bg: 'bg-stone-100',
      fit: 'object-cover',
      transition: 'transition-all duration-500',
      outOfStock: 'grayscale opacity-60',
      uploading: 'opacity-50 blur-[2px]',
      placeholderIcon: 'text-5xl text-stone-300 select-none flex items-center justify-center',
      placeholderFrame: `bg-white px-2 py-1 border border-stone-200 shadow-sm flex items-center justify-center ${BR.low}`,
      overlay: 'absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center',
      changeBadge: `bg-white/90 px-3 py-1.5 shadow-xl ${BR.full} ${FS.xs}`,
      cursorUser: 'cursor-zoom-in',
      cursorAdmin: 'cursor-pointer',
    },
    typography: {
      name: `${FS.sm} text-stone-900 leading-tight tracking-tight`,
      nameOutOfStock: 'opacity-60 text-stone-500',
      nameTransition: 'transition-all duration-300',
      description: `${FS.xs} text-stone-500 leading-snug font-medium normal-case`,
      descriptionClamp: 'line-clamp-2',
      descriptionFull: 'w-full',
      price: `${FS.base} font-black tracking-tight transition-all duration-500`,
      priceOutOfStock: 'line-through opacity-60 text-stone-500',
      discountPrice: 'text-kraft-600',
      categoryBadge: `${FS.xs} text-stone-400`,
      editable: 'cursor-text focus:outline-none outline-none',
    },
    adminMenu: {
      container: 'absolute right-1 bottom-1 z-30',
      toggleButton: '!bg-stone-50/80 backdrop-blur shadow-sm border-stone-200',
      dropdown: `absolute bottom-full right-0 mb-2 w-48 bg-white/95 backdrop-blur-2xl border border-stone-200 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-bottom-right ${BR.md}`,
      item: 'w-full text-left px-4 py-2.5 hover:bg-stone-50 border-b border-stone-100 last:border-0 transition-colors',
      itemText: `${FS.sm} text-stone-800`,
      categoryListWrapper: 'max-h-48 overflow-y-auto py-1 custom-scrollbar',
      categoryActive: 'text-stone-900 bg-stone-100',
      categoryInactive: 'text-stone-500',
      mobileToggle: `lg:hidden relative flex items-center justify-center w-11 h-11 bg-stone-50/80 backdrop-blur border border-stone-200 transition-all shadow-sm overflow-hidden active:scale-90 ${BR.low}`,
      mobileIconColor: 'text-stone-500',
      backBtn: `w-full text-left px-4 py-2 ${FS.xs} font-black text-stone-400 bg-stone-50/50 border-b border-stone-100 uppercase flex items-center gap-2`,
      editHighlight: 'bg-amber-50/50',
      editBorder: 'border-amber-200',
      editPadding: 'px-1 py-0.5',
      textareaBase: 'w-full focus:outline-none resize-none overflow-hidden block',
    },
    orderSelect: {
      container: 'absolute top-2 right-2 z-[25] transition-all duration-300 transform',
      adminAnimation: 'opacity-100 scale-100',
      userAnimation: 'opacity-0 scale-90 pointer-events-none',
      wrapper: `relative w-7 h-7 bg-white/90 backdrop-blur-md shadow-lg border border-stone-200 flex items-center justify-center overflow-hidden ${BR.low}`,
      select: `absolute inset-0 w-full h-full bg-transparent text-stone-900 ${FS.xs} font-black appearance-none text-center m-0 p-0 border-none outline-none cursor-pointer`,
    },
    uploadOverlay: {
      wrapper: 'absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-[1px] z-10',
      spinner: `w-8 h-8 border-4 border-stone-300 border-t-stone-900 ${BR.full} animate-spin mb-2`,
      label: `${FS.xs} font-black text-stone-900 bg-white/80 px-2 py-0.5 rounded shadow-sm`
    },
    status: {
      wrapper: 'absolute inset-0 z-[5] pointer-events-none rounded-lg flex items-center justify-center gap-2',
      badge: `bg-stone-900/90 text-white w-9 h-9 ${BR.full} shadow-2xl flex items-center justify-center -translate-y-4`,
      iconSize: 'text-lg',
    }
  },

  addProductModal: {
    overlay: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4',
    container: `bg-white w-full max-w-sm ${BR.lg} shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300`,
    header: 'flex items-center justify-between px-6 py-5 border-b border-stone-100',
    headerButton: `!w-11 !h-11 !bg-stone-100 !text-stone-500 hover:!bg-stone-200 hover:!text-stone-900 ${BR.low}`,
    body: 'p-6 space-y-6 overflow-y-auto custom-scrollbar',
    formGap: 'space-y-5',
    footer: 'flex gap-3 pt-2 pb-2',
    footerCancel: 'flex-1 !border-2 !border-stone-100 !text-stone-400 !py-3.5',
    footerSubmit: 'flex-[1.5] !py-3.5',
    inputField: `w-full border border-stone-200 ${BR.low} px-3 py-2.5 ${FS.sm} focus:outline-none focus:ring-2 focus:ring-stone-900 transition outline-none bg-stone-50/50`,
    stockToggle: `flex items-center justify-between bg-stone-50 border border-stone-200 ${BR.low} px-4 py-3.5 shadow-sm`,
    checkbox: `w-5 h-5 text-stone-900 border-stone-300 rounded-[0.2rem] focus:ring-0 cursor-pointer shadow-sm`,
    categoryChipActive: `bg-stone-900 text-white border-stone-900 px-3 py-1.5 ${FS.xs} font-bold ${BR.full} transition-all shadow-sm`,
    categoryChipInactive: `bg-white text-stone-600 border-stone-200 hover:border-stone-400 active:scale-95 px-3 py-1.5 ${FS.xs} font-bold ${BR.full} transition-all shadow-sm`,
    categoryShowMore: `${BR.full} px-3 py-1.5 ${FS.xs} font-bold border border-dashed border-stone-300 text-stone-500 hover:border-stone-500 hover:text-stone-700 transition-all bg-stone-50 active:scale-95`,
    typography: {
      label: `${FS.xs} font-semibold text-stone-600 mb-1`,
      categoryLabel: `${FS.xs} font-semibold text-stone-600 mb-2`,
      errorBadge: `bg-red-50 text-red-600 ${FS.xs} font-bold uppercase p-3 ${BR.low} text-center border border-red-100 shadow-sm`,
    },
    imagePicker: {
      wrapper: 'flex flex-col items-center gap-3',
      frame: `w-24 h-24 shrink-0 ${BR.md} bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden shadow-sm`,
      button: `cursor-pointer ${FS.xs} font-black text-stone-700 hover:text-stone-900 transition-colors border border-stone-200 px-5 py-2 ${BR.full} bg-white shadow-sm active:scale-95`,
    }
  },

  references: {
    layout: 'bg-stone-50/50 border-t border-stone-100 py-12 md:py-16',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    headerTitle: `text-center ${FS.xs} font-black text-stone-400 mb-8 md:mb-12`,
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8',
    card: {
      base: `flex flex-col items-center justify-center gap-2 bg-white border border-stone-100 py-6 px-4 hover:border-stone-300 hover:shadow-md active:scale-95 transition-all shadow-sm ${BR.low}`,
      logoSize: 'text-3xl filter grayscale hover:grayscale-0 transition-all duration-500',
      name: `${FS.xs} font-black text-stone-500 text-center`,
    }
  },

  pinModal: {
    overlay: 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-500',
    container: 'relative w-full max-w-[240px] sm:max-w-[280px] flex flex-col items-center select-none transform transition-transform duration-300',
    headerWrapper: 'text-center mb-6',
    headerIconWrapper: `w-12 h-12 bg-white/10 backdrop-blur-md ${BR.md} flex items-center justify-center mx-auto mb-3 shadow-xl border border-white/20`,
    headerIconSize: 'w-6 h-6 text-white',
    dotsWrapper: 'flex justify-center gap-4 mb-8',
    dotBase: `w-2.5 h-2.5 ${BR.full} border transition-all duration-300`,
    dotActive: 'bg-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.5)] border-white',
    dotInactive: 'bg-transparent border-white/40',
    dotError: 'bg-red-500 border-red-500',
    keyboardGrid: 'grid grid-cols-3 gap-x-4 gap-y-3 w-full',
    keyButton: `group relative w-14 h-14 sm:w-16 sm:h-16 ${BR.full} bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/10 backdrop-blur-md transition-all flex items-center justify-center mx-auto overflow-hidden active:scale-90`,
    cancelButton: `w-14 h-14 sm:w-16 sm:h-16 ${BR.full} flex items-center justify-center mx-auto text-white/40 hover:text-white/80 transition-colors ${FS.xs} font-bold active:scale-95`,
    deleteButton: `w-14 h-14 sm:w-16 sm:h-16 ${BR.full} flex items-center justify-center mx-auto text-white/60 hover:text-white active:scale-90 transition-all`,
    deleteIconSize: 'w-6 h-6',
    typography: {
      title: `${FS.base} text-white font-bold`,
      subtitle: `${FS.xs} text-white/60 mt-1 font-medium`,
      keyText: `${FS.lg} font-light text-white leading-none`,
    },
    animations: {
      shake: 'animate-shake',
    }
  },

  modal: {
    overlay: 'fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/40 backdrop-blur-2xl p-4 md:p-8 animate-in fade-in duration-500',
    closeButtonWrapper: 'absolute top-6 right-6 z-[210]',
    closeButtonCustom: '!bg-white/80',
    imageWrapper: 'w-full flex items-center justify-center max-h-[50vh] md:max-h-[55vh]',
    image: `max-w-full max-h-[50vh] md:max-h-[55vh] object-contain shadow-2xl ${BR.lg}`,
    contentWrapper: 'text-center space-y-4 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-700',
    headerWrapper: 'space-y-1',
    title: `${FS.xl} text-stone-900`,
    description: `${FS.base} text-stone-500 leading-relaxed font-medium px-6`,
    priceBadge: `bg-white/80 backdrop-blur-sm px-6 py-2.5 border border-stone-100 shadow-sm ${FS.lg} text-stone-900 ${BR.full}`,
    actionArea: 'flex flex-col items-center gap-5 pt-2',
  }
};

/**
 * UI SETTINGS (LAYOUT & LIMITS)
 */
export const UI = {
  layout: {
    bodyBg: 'bg-stone-50',
    selection: 'selection:bg-stone-900 selection:text-white',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    adminLimit: 999,
  },
  category: {
    initialVisible: 6,
  },
  errorState: {
    overlay: 'min-h-screen flex flex-col items-center justify-center p-6 text-center bg-stone-50',
    card: `bg-white p-10 ${BR.lg} shadow-2xl border border-stone-100 max-w-sm w-full animate-in zoom-in-95 duration-500`,
    icon: 'text-6xl mb-6 block',
    title: `${FS.lg} text-stone-900 mb-3`,
    description: `${FS.sm} text-stone-500 leading-relaxed mb-8`,
    button: `w-full bg-stone-900 text-white py-4 ${BR.md} ${FS.xs} font-black hover:bg-stone-800 active:scale-95 transition-all shadow-xl`,
  }
};
