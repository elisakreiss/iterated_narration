library(tidyverse)
library(here)

# set_here("/Users/elisakreiss/Documents/business/projects/iterated_narration")

# df = read_csv(here("data","02_main","01_reproduction-inLab","raw_confidential.csv"))
# 
# anonymous_df = arrange(df,submission_id) %>% 
#   mutate(id=sort(rep(seq.int(1,length(unique(submission_id))),5))) %>% 
#   select(-comments, -submission_id)
# 
# write.csv(anonymous_df, file = here("data","02_main","01_reproduction-inLab","raw.csv"), row.names = FALSE)

df = read_csv(here("data","02_main","01_reproduction-inLab","raw.csv"))

d_flowchart = df %>%
        select(chain,deadend,generation,reproduction,story_text,story_title)

# there is only one deadend because of multiple entries
d_flowchart[d_flowchart$deadend=="true" & !d_flowchart$generation==5,]

d_flowchart$story_text = gsub("(.{201,}?)\\s", "\\1\n", d_flowchart$story_text)
d_flowchart$reproduction = gsub("(.{61,}?)\\s", "\\1\n", d_flowchart$reproduction)
write.csv(d_flowchart, file = here("data","02_main","01_reproduction-inLab","flowchart_data.csv"), row.names = FALSE)

# currently we use all reproductions
d_followup = df %>%
  select(chain,generation,reproduction,story_title)

write.table(d_followup, file = here("experiments","02_main","02_subjective-ratings","trial_info","reproduction-data.csv"), sep=";", row.names = FALSE, qmethod = "double")

selectChains <- function(condition){
  chains = df %>% 
    filter((generation == 5) & (story_title == condition)) %>% 
    select(chain) %>% 
    distinct() %>% 
    slice(1:5)
  return(chains)
}

target_chains = bind_rows(selectChains('arson_free'),selectChains('arson_jail'),selectChains('bees_free'),selectChains('bees_jail'),selectChains('professor_free'),selectChains('professor_jail'),selectChains('scam_free'),selectChains('scam_jail'),selectChains('smuggler_free'),selectChains('smuggler_jail'))

d_subj_ratings = df %>% 
  subset(chain %in% target_chains$chain) %>% 
  select(chain,deadend,generation,reproduction,story_text,story_title) %>%  
  # only choose rows with reproductions that don't occur as story_text in the next generation
  filter((reproduction %in% story_text | generation == 5)) %>% 
  group_by(chain,generation) %>% 
  sample_n(1)

# table(d_pilot$chain,d_pilot$generation)

write.table(d_subj_ratings, file = here("experiments","02_main","02_subjective-ratings","trial_info","new-reproduction-data-ADDORIGINALS.csv"), sep=";", row.names = FALSE, qmethod = "double")

# randomly choose two complete chains that are not in main experiment (jail and free condition) for pilot
d_pilot = df %>% 
  filter(chain=="mMLRHJaK0CYrkHG1" | chain=="b2lFKlRgR8OxDUPI") %>% 
  select(chain,generation,reproduction,story_title)

write.table(d_pilot, file = here("experiments","01_pilot","09_subjective-ratings","trial_info","pilot-reproduction-data.csv"), sep=";", row.names = FALSE, qmethod = "double")
