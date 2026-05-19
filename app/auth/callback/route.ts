import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {

  const { searchParams } =
    new URL(request.url)

  const id =
    searchParams.get('id')

  if (!id) {

    return Response.redirect(
      new URL('/login', request.url)
    )

  }

  const supabase = createClient(

    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  )

  // Crear perfil

  await supabase

    .from('perfiles')

    .upsert([{

      id,

      rol: 'cliente'

    }])

  return Response.redirect(
    new URL('/', request.url)
  )

}