import { supabase } from './supabaseClient'

export async function verIdentificacion(path: string | null) {
    if (!path) return
    const { data, error } = await supabase.storage
        .from('identificaciones')
        .createSignedUrl(path, 60)

    if (error || !data) {
        alert('No se pudo abrir la foto.')
        return
    }

    window.open(data.signedUrl, '_blank')
}