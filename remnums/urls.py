from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'remnums.views.home', name='home'),

    # regular views
    url(r'^/?$', 'memmit.views.show_memmit'),
    url(r'^try/(?P<memmit_type>\w+)/?$', 'memmit.views.show_memmit'),

    # JSON views
    url(r'^json/memmit/(?P<memmit_type>\w+)/?$', 'memmit.json.get_memmit'),
    url(r'^json/memmit/(?P<memmit_type>\w+)/random/?$', 'memmit.json.get_randomized_memmit'),
    url(r'^json/memmit/(?P<memmit_type>\w+)/simplify/?$', 'memmit.json.get_simplified_memmit'),
    url(r'^json/language/set/?$', 'memmit.json.set_language'),

    # admin
    url(r'^admin/', include(admin.site.urls)),
)
