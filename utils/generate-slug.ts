const translit = (str:string): string  => {
    const ru  = 
    'А-а-Б-б-В-в-Г-г-Д-д-Е-е-Ё-е-Ж-ж-З-з-И-и-Й-й-К-к-Л-л-М-м-Н-н-О-о-П-п-Р-р-С-с-Т-т-У-у-Ф-ф-Х-х-Ц-ц-Ч-ч-Ш-ш-Щ-щ-Ъ-ъ-Ы-ы-Ь-ь-Э-э-Ю-ю-Я-я'.split('-')

    const en = 'A-a-B-b-C-c-D-d-E-e-Q-q-W-w-R-r-T-t-Y-y-U-u-I-i-O-o-P-p-S-s-F-f-G-g-H-h-J-j-K-k-L-l-Z-z-X-x-V-v-N-n-M-m'.split('-')

    let res = '';
    for(let i = 0, l = str.length; i < l; i++) {
        const s = str.charAt(i),
        n = ru.indexOf(s)
        if(n >= 0){
            res += en[n]
        } else {
            res += s
        }
    }
    return res;
}

export const generateSlug = (str:string): string => {
    let url: string = str.replace(/[\s]+/gi, '-')
    url = translit(url)

    url = url
        .replace(/[^0-9a-z_\-] + /gi, '')
        .replace('---', '-')
        .replace('--', '-')
        .toLowerCase()
    return url
}


