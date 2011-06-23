ActionController::Routing::Routes.draw do |map|
  # The priority is based upon order of creation: first created -> highest priority.
  map.connect 'projects',
    :controller => "project",
    :action => "index"

  map.connect 'stocks',
    :controller => "stock",
    :action => "index"

  map.connect 'experiments',
    :controller => "nd_experiment",
    :action => "index"

  map.resources :phenotype do |phenotypes|
    phenotypes.resources :cvterms
  end

  map.resources :nd_experiment, :as => 'experiment' do |ndexperiments|
    # experiment.resources :cvterms
  end

  map.resources :stock do |stock|
    # experiment.resources :cvterms
  end

  map.resources :cvterm do |cvterm|
  end

  map.resources :project do |project|
    # experiment.resources :cvterms
  end

   map.connect 'project/:id/:action.:format',
    :controller => "project"

#   map.connect 'project/:id/head.:format',
#    :controller => "project",
#    :action => "head"
 
#   map.connect 'project/:id/stocks.:format',
#    :controller => "project",
#    :action => "stocks"

#   map.connect 'project/:id/experiments.:format',
#    :controller => "project",
#    :action => "experiments"

   map.connect 'stock/:id/:action.:format',
    :controller => "stock"

#   map.connect 'stock/:id/head.:format',
#    :controller => "stock",
#    :action => "head"
 
#   map.connect 'stock/:id/projects.:format',
#    :controller => "stock",
#    :action => "projects"
 
#   map.connect 'stock/:id/experiments.:format',
#    :controller => "stock",
#    :action => "experiments"

   map.connect 'experiment/:id/:action.:format',
    :controller => "nd_experiment"

#   map.connect 'experiment/:id/head.:format',
#    :controller => "nd_experiment",
#    :action => "head"

#   map.connect 'experiment/:id/stocks.:format',
#    :controller => "nd_experiment",
#    :action => "stocks"

#   map.connect 'experiment/:id/projects.:format',
#    :controller => "nd_experiment",
#    :action => "projects"



#  map.connect 'plot/:id',
#    :controller => "viz",
#    :action => "plot"

#  map.connect 'plot/:type/:id',
#    :controller => "viz",
#    :action => "plot"
  
#  map.connect "*anything",
#   :controller => "home",
#   :action => "index"

end
