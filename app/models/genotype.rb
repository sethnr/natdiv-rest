class Genotype < ActiveRecord::Base
  validates_presence_of( :uniquename )

  has_many :nd_assay_genotypes
  has_many :wwwuser_genotypes
  has_many :genotypeprops , :foreign_key => :genotype_id


  def as_json(options = {})
    {
      :id => genotype_id,
      :name => name,
      :uniquename => uniquename,
      :description => description,
      :props => genotypeprops.as_json,
    }
  end
end
