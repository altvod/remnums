from django.shortcuts import render

from memmit.memmits import get_memmit_by_type


def show_memmit(request, memmit_type='numbers'):
    memm = get_memmit_by_type(memmit_type)
    memm.randomize()
    rendered_memm = memm.render()
    return render(request, 'memmit_page.html', {
        'rendered_memmit': rendered_memm,
    })
