library(tidyverse)
library(summarytools)
library(gridExtra)
library(here)

theme_set(theme_bw(18))

df = read_csv(here("data","01_pilot","09_subjective-ratings","raw_confidential.csv"))

anonymous_df = df %>% 
  filter(!is.na(worker_id)) %>% 
  mutate(id=submission_id-min(submission_id)) %>% 
  select(-worker_id,-assignment_id,-submission_id,-hit_id,-experiment_id)

write.csv(anonymous_df, file = here("data","01_pilot","09_subjective-ratings","raw.csv"), row.names = FALSE)

# let me just delete this

glimpse(df)

# other info
df_subj = df %>% 
  select(subj,age,gender,education,languages,enjoyment,timeSpent,comments) %>% 
  distinct() %>% 
  mutate_at(vars(languages), funs(str_to_lower(.))) %>% 
  mutate_at(vars(age), funs(as.integer(.)))

p_age = ggplot(df_subj,aes(x=age)) + 
  geom_bar(width = .5,
           fill = "orange") 

p_gen = ggplot(df_subj,aes(x=gender)) +
  geom_bar(width = .5,
           fill = "orange")

p_edu = ggplot(df_subj,aes(x=education)) +
  geom_bar(width = .5,
           fill = "orange")

p_lang = ggplot(df_subj,aes(x=languages)) +
  geom_bar(width = .5,
           fill = "orange")

p_enj = ggplot(df_subj,aes(x=enjoyment)) + 
  geom_bar(width = .5,
           fill = "orange")

p_time = ggplot(df_subj,aes(x=timeSpent)) +
  geom_histogram(fill = "orange")

grid.arrange(p_age,p_gen,p_edu,p_lang,p_enj,p_time)

unique(df_subj$comments)

# HitCorrect

# plots

# attention checks:
control1_fail = df[df$trial_type=="control1_false" & df$slider_val>50 & df$box_checked=="false",]$id
control2_fail = df[df$trial_type=="control2_false" & df$slider_val>50 & df$box_checked=="false",]$id
control3_fail = df[df$trial_type=="control3_true" & df$slider_val<50 & df$box_checked=="false",]$id
control4_fail = df[df$trial_type=="control4_true" & df$slider_val>50 & df$box_checked=="false",]$id
# 13, 7, 10

df_clean = df %>% 
  filter(!((id==7)|(id==10)|(id==13))) %>% 
  select(id,generation,chain,trial_type,question,slider_val,box_checked,story_reproduction,story_title,trial_number)

df_x = df_clean

df_corr = df_x %>% 
  select(id,trial_type,slider_val) %>% 
  group_by(id) %>% 
  spread(trial_type,slider_val) %>% 
  ungroup() %>% 
  select(-id,-control1_false,-control2_false,-control3_true,-control4_true)

chart.Correlation(df_corr, histogram=TRUE, pch=19)
res = cor(df_corr)
corrplot(res, method = "number", type = "upper", order = "hclust", 
         tl.col = "black", tl.srt = 45)


# condition split-up!

df_plots_slider = df %>% 
  filter(box_checked=="false")

p_slider = ggplot(df_plots_slider,aes(x=trial_type,y=slider_val)) +
  geom_point(alpha = 0.2,
             position = position_jitter(width = 0.1, height = 0),
             size = 2) + 
  # error bars 
  stat_summary(fun.data = "mean_cl_boot",
               geom = "linerange",
               color = "black",
               size = 1) + 
  # means
  stat_summary(fun.y = "mean",
               geom = "point",
               shape = 21,
               fill = "red",
               color = "black",
               size = 4) +
  # facet_grid(rows = vars(generation)) +
  theme(axis.text.x = element_text(angle = 45))

# TODO: needs to be separated by generation
df_plots_box = df %>% 
  # filter(box_checked=="true") %>% 
  select(box_checked,trial_type) %>% 
  group_by(trial_type,box_checked) %>% 
  summarize(total_count = n()) %>%
  spread(key=box_checked,value=total_count)  

p_checkbox = ggplot(df_plots_box,aes(x=trial_type,y=true)) +
  geom_bar(stat = "identity",
           fill = "orange") +
  facet_grid(rows = vars(generation)) +
  theme(axis.text.x = element_text(angle = 45))

grid.arrange(p_slider,p_checkbox)
